import React from 'react';
import { useWebId } from '@solid/react';
import { fetchDocument } from 'tripledoc';
import { ldp } from 'rdf-namespaces';

async function getInboxUrl(webId: string) {
  const profileDoc = await fetchDocument(webId)
  const profile = profileDoc.getSubject(webId);
  const inboxUrl = profile.getNodeRef(ldp.inbox);
  return inboxUrl;
}

async function getContainerItems(containerUrl: string) {
  const containerDoc = await fetchDocument(containerUrl);
  const containerNode = containerDoc.getSubject('');
  const containerItemRefs = containerNode.getAllNodeRefs(ldp.contains);
  const containedDocs = await Promise.all(containerItemRefs.map(nodeRef => {
    return fetchDocument(nodeRef);
  }))
  return containedDocs;
}

async function getFriendRequestsFromInbox(webId: string) {
  const inboxUrl = await getInboxUrl(webId);
  if (!inboxUrl) {
    return [];
  }
  const inboxItems = await getContainerItems(inboxUrl)
  return inboxItems;
}
export const IncomingList: React.FC = () => {
  const webId = useWebId();
  const [friendRequests, setFriendRequests] = React.useState<Array<{ name: string, picture: string }>>();

  React.useEffect(() => {
    if (webId) {
      getFriendRequestsFromInbox(webId).then((friendRequests) => {
        console.log('Fetched the following inbox items:', friendRequests);
      })
    }
  }, [webId]);

  return <>
    {friendRequests ?
      friendRequests.map((item, index) => (
        <li>friend request</li>
      )
    ) : 'Inbox zero :)'}
  </>;
};
