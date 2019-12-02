import { useWebId } from "@solid/react";
import { getDocument } from "./DocumentCache";
import { TripleDocument } from "tripledoc";
import { ldp, schema } from "rdf-namespaces";
import React from "react";
import { determineInboxesToUse } from "./sendActionNotification";
import SolidAuth from 'solid-auth-client';
import { getMyWebId } from "./getMyWebId";

export type IncomingFriendRequest = {
  webId: string,
  inboxItem: string
};

export async function removeRemoteDoc(url: string) {
  return await SolidAuth.fetch(url, {
    method: 'DELETE'
  });
}


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

export async function removeAllInboxItems (webId: string) {
  const myWebId = await getMyWebId();
  if (!myWebId) {
    return;
  }
  const items = await getIncomingFriendRequests(myWebId);
  await Promise.all(items.map(item => {
    if (item.webId === webId) {
      return removeRemoteDoc(item.inboxItem);
    }
  }));
}

export async function getIncomingFriendRequests(webId: string): Promise<IncomingFriendRequest[]> {
  const myInboxUrls: string[] = await determineInboxesToUse(webId);
  let ret: IncomingFriendRequest[] = [];
  await Promise.all(myInboxUrls.map(async (url: string) => {
    console.log('checking inbox', url);
    const notificationDocs = await getContainerDocuments(url);
    const filtered: IncomingFriendRequest[] = [];
    await Promise.all(notificationDocs.map(async (doc: TripleDocument) => {
      const inboxItem = doc.asRef();
      // console.log({ inboxItem });
      const webId = doc.getSubject(inboxItem).getRef(schema.agent);
      // console.log('schema agent', webId, doc.getStatements());
      if (webId) {
        let isDuplicate = false;
        await Promise.all(filtered.map(async (item: IncomingFriendRequest) => {
          if (item.webId === webId) {
            console.log('Duplicate found, removing');
            isDuplicate = true;
            await removeRemoteDoc(inboxItem);
          } else {
            console.log('no duplicate', item.webId, webId);
          }
        }));
        if (!isDuplicate) {
          filtered.push({
            webId,
            inboxItem
          });
        }
      }
    }));
    ret = ret.concat(filtered);
  }));
  return ret;
}
