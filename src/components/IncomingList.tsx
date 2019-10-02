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

interface Props {
  inboxUrl: string;
};

export const IncomingList: React.FC<Props> = (props) => {
  const webId = useWebId();
  console.log('retrieving profile doc of', webId)
  let inboxUrl = '[inbox url]'
  if (webId && ! props.inboxUrl) {
    getInboxUrl(webId).then(inboxUrl => {
      console.log(inboxUrl, 'now what?')
    })
  }
  return <>
    Incoming list will go here, will read from {props.inboxUrl}.
  </>;
};
