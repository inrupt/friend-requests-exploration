import React from 'react';
import { useWebId } from '@solid/react';
import { fetchDocument } from 'tripledoc';
import { ldp } from 'rdf-namespaces';
import { ProfessionalService } from 'rdf-namespaces/dist/schema';

async function getInboxUrl(webId: string) {
  const profileDoc = await fetchDocument(webId)
  const profile = profileDoc.getSubject(webId);
  const inboxUrl = profile.getNodeRef(ldp.inbox);
  return inboxUrl;
}

export const IncomingList: React.FC = () => {
  const webId = useWebId();
  const [inboxUrl, setInboxUrl] = React.useState<string>();
  console.log('retrieving profile doc of', webId)
  if (webId && !inboxUrl) {
    getInboxUrl(webId).then(inboxUrl => {
      console.log(inboxUrl)
      if (inboxUrl) {
        setInboxUrl(inboxUrl)
      }
    })
  }
  return <>
    Incoming list will go here, will read from {inboxUrl}.
  </>;
};
