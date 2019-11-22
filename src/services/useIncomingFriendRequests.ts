import { useWebId } from "@solid/react";
import { useDocument, getDocument } from "./DocumentCache";
import { TripleSubject, TripleDocument } from "tripledoc";
import { ldp, schema } from "rdf-namespaces";
import React from "react";

export type IncomingFriendRequest = {
  webId: string,
  inboxItem: string
};

async function getFriendsListUri(webId: string): Promise<string | null> {
  const myProfileDoc = await getDocument(webId);
  if (myProfileDoc) {
    const myProfileSub: TripleSubject = myProfileDoc.getSubject(webId);
    return myProfileSub.getRef(ldp.inbox);
  }
  return null;
}

async function getSubjectInboxUrl(uri: string): Promise<string | null> {
  const doc = await getDocument(uri);
  if (doc) {
    const sub: TripleSubject = doc.getSubject(uri);
    return sub.getRef(ldp.inbox);
  }
  return null;
}

async function getPersonInboxUrl(webId: string): Promise<string | null> {
  const friendsListUri = await getFriendsListUri(webId);
  if (friendsListUri) {
    return getSubjectInboxUrl(friendsListUri);
  }
  const globalInboxUrl = await getSubjectInboxUrl(webId);
  return globalInboxUrl;
}

async function getContainerDocuments(containerUrl: string): Promise<TripleDocument[]> {
  const containerDoc = await getDocument(containerUrl);
  if (containerDoc) {
    const containerSub = containerDoc.getSubject(containerUrl);
    const containerItemUrls = containerSub.getAllRefs(ldp.contains);
    const result: TripleDocument[] = [];
    const promises = containerItemUrls.map(async (url: string) => {
      const doc = useDocument(url);
      if (doc) {
        result.push(doc);
      }
    });
    await Promise.all(promises);
    return result;
  }
  return [];
}

export function useIncomingFriendRequests(): IncomingFriendRequest[] | null {
  const [ incomingFriendRequests, setIncomingFriendRequests ] = React.useState<IncomingFriendRequest[] | null>(null);
  const webId: string | null = useWebId() || null;
  if (webId && !incomingFriendRequests) {
    getIncomingFriendRequests(webId).then(setIncomingFriendRequests).catch((e: Error) => {
      console.error(e.message);
    });
  }
  return incomingFriendRequests;
}

async function getIncomingFriendRequests(webId: string): Promise<IncomingFriendRequest[]> {
  const myInboxUrl = await getPersonInboxUrl(webId);
  if (myInboxUrl) {
    const notificationDocs = await getContainerDocuments(myInboxUrl);
    const filtered: IncomingFriendRequest[] = [];
    notificationDocs.forEach((doc) => {
      const inboxItem = doc.asRef();
      const webId = doc.getSubject(inboxItem).getRef(schema.agent);
      if (webId) {
        filtered.push({
          webId,
          inboxItem
        });
      }
    });
    return filtered;
  }
  return [];
}
