import { useWebId } from "@solid/react";
import { useDocument } from "./DocumentCache";
import { TripleSubject, TripleDocument } from "tripledoc";
import { ldp, schema } from "rdf-namespaces";

export type IncomingFriendRequest = {
  webId: string | null,
  inboxItem: string
};

export function useIncomingFriendRequests(): IncomingFriendRequest[] | null {
  const webId: string | null = useWebId() || null;
  const myProfileDoc = useDocument(webId);
  let inboxUrl = null;
  if (webId && myProfileDoc) {
    const myProfileSub: TripleSubject = myProfileDoc.getSubject(webId);
    inboxUrl = myProfileSub.getRef(ldp.inbox);
  }
  const myInboxDoc = useDocument(inboxUrl);
  let inboxItemUrls: string[] | null = null;
  if (inboxUrl && myInboxDoc) {
    const myInboxSub = myInboxDoc.getSubject(inboxUrl);
    inboxItemUrls = myInboxSub.getAllRefs(ldp.contains);
  }
  let notificationDocs: TripleDocument[] = [];
  if (Array.isArray(inboxItemUrls)) {
    inboxItemUrls.forEach((url: string) => {
      const doc: TripleDocument | null = useDocument(url);
      if (doc !== null) {
        notificationDocs.push(doc);
      }
    })
  }
  if (notificationDocs) {
    return notificationDocs.map((doc): IncomingFriendRequest => {
      const url = doc.asRef();
      return {
        webId: doc.getSubject(url).getRef(schema.agent),
        inboxItem: url
      }
    });
  }
  return null;
}
