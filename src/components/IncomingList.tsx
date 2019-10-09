import React from 'react';
import { useWebId } from '@solid/react';
import { fetchDocument } from 'tripledoc';
import { ldp, schema, vcard } from 'rdf-namespaces';

async function getInboxUrl(webId: string) {
  const profileDoc = await fetchDocument(webId)
  const profile = profileDoc.getSubject(webId);
  const inboxUrl = profile.getNodeRef(ldp.inbox);
  return inboxUrl;
}

async function getContainerItems(containerUrl: string): Promise<string[]> {
  const containerDoc = await fetchDocument(containerUrl);
  const containerNode = containerDoc.getSubject('');
  const containerItemRefs = containerNode.getAllNodeRefs(ldp.contains);
  const containedDocs = await Promise.all(containerItemRefs.map(async (nodeRef) => {
    try {
      return await fetchDocument(nodeRef);
    } catch(e) {
      return null;
    }
  }))
  const webIds: string[] = [];
  containedDocs.forEach((doc) => {
    if (doc !== null) {
      const subjects = doc.getSubjectsOfType(schema.BefriendAction)
      // console.log('got doc!', subjects, doc);
      subjects.forEach((subject) => {
        const agent = subject.getNodeRef(schema.agent);
        // console.log('got subject!', subject, agent);
        if (typeof agent === 'string') {
          webIds.push(agent)
        }
      })
    }
  });
  return webIds;
}
async function resolveWebId(webId: string): Promise<any> {
  try {
    console.log('fetching', webId)
    const profileDoc = await fetchDocument(webId);
    const sub = profileDoc.getSubject(webId)
    const name = sub.getLiteral(vcard.fn)
    const picture = sub.getNodeRef(vcard.hasPhoto)
    console.log('fetched', webId, name, picture);
    return { name, picture }
  } catch (e) {
    console.error('failed to fetch profile for friend request', webId);
    return null;
  }
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
      getFriendRequestsFromInbox(webId).then((friendRequestWebIds) => {
        return Promise.all(friendRequestWebIds.map(async (webId) => {
          const obj = await resolveWebId(webId).catch((err) => {
            console.error('why did we catch this here and not inside resolveWebId?', err.message);
          });
          return obj;
        }));
      }).then((friendRequestObjs) => {
        console.log('Fetched the following inbox items:', friendRequestObjs);
        // FIXME: having a bit of a fight convincing TypeScript here
        // that after filtering, obj.name and obj.picture are definitely strings:
        const filtered: { name: string, picture: string}[] = [];
        friendRequestObjs.map(obj => {
          console.log('got requester profile', obj)
          if ((!!obj.name) && (!!obj.picture)) {
            filtered.push({
              name: obj.name as string,
              picture: obj.picture as string
            });
          }
        });
        setFriendRequests(filtered);
      });
    }
  }, [webId]);

  return <>
    {friendRequests ?
      friendRequests.map((item, index) => (
      <li>
         Friend request from "{item.name}"
         <img src={item.picture}/>
         <button type="submit" className='button is-primary'>Accept</button>
         <button type="submit" className='button is-warning'>Reject</button>
      </li>
      )
    ) : 'Inbox zero :)'}
  </>;
};
