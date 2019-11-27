import { useWebId } from "@solid/react";
import { getDocument } from "./DocumentCache";
import { TripleDocument } from "tripledoc";
import { ldp, schema } from "rdf-namespaces";
import React from "react";
import { determineInboxesToUse } from "./sendActionNotification";

export type IncomingFriendRequest = {
  webId: string,
  inboxItem: string
};

async function getContainerDocuments(containerUrl: string): Promise<TripleDocument[]> {
  const containerDoc = await getDocument(containerUrl);
  if (containerDoc) {
    const containerSub = containerDoc.getSubject(containerUrl);
    const containerItemUrls = containerSub.getAllRefs(ldp.contains);
    const result: TripleDocument[] = [];
    const promises = containerItemUrls.map(async (url: string) => {
      // console.log('fetching inbox doc', url);
      try {
        const doc = await getDocument(url);
        if (doc) {
          result.push(doc);
        }
      } catch (e) {
        // console.error('could not parse inbox item', url, e);
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
  const myInboxUrls: string[] = await determineInboxesToUse(webId);
  let ret: IncomingFriendRequest[] = [];
  const promises: Promise<void>[] = myInboxUrls.map(async (url: string) => {
    const notificationDocs = await getContainerDocuments(url);
    const filtered: IncomingFriendRequest[] = [];
    notificationDocs.forEach((doc: TripleDocument) => {
      const inboxItem = doc.asRef();
      // console.log({ inboxItem });
      const webId = doc.getSubject(inboxItem).getRef(schema.agent);
      // console.log('schema agent', webId, doc.getStatements());
      if (webId) {
        filtered.push({
          webId,
          inboxItem
        });
      }
    });
    ret = ret.concat(filtered);
  });
  await Promise.all(promises);
  return ret;
}
