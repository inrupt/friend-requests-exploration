import React from 'react';
import { useWebId } from '@solid/react';
import { fetchDocument, TripleSubject } from 'tripledoc';
import { ldp, schema, vcard } from 'rdf-namespaces';
import SolidAuth from 'solid-auth-client';
import { fetchDocumentForClass } from 'tripledoc-solid-helpers';

export class PersonData {
  url?: string
  webId?: string
  name?: string | null
  picture?: string | null
  constructor() {
  }
  async fetchAndParse() {
    if (!this.url) {
      throw new Error('no inbox item url');
    }
    const doc = await fetchDocument(this.url);
    if (doc !== null) {
      const subjects = doc.getSubjectsOfType(schema.BefriendAction);
      if (subjects.length === 0) {
        // inbox item does not contain a schema.BefriendAction
        return;
      }
      if (subjects.length > 1) {
        console.warn(`Notification contains ${subjects.length} schema.BefriendActions, only first one used.`);
      }
      const subjectToUse: TripleSubject = subjects[0];
      this.webId = subjectToUse.getNodeRef(schema.agent) || undefined;
    }
  }
  async fetchProfile() {
    if (!this.webId) {
      return;
    }
    try {
      const profileDoc = await fetchDocument(this.webId);
      const sub = profileDoc.getSubject(this.webId)
      this.name = sub.getString(vcard.fn)
      this.picture = sub.getNodeRef(vcard.hasPhoto)
    } catch (e) {
      console.error('failed to fetch profile for friend request', this.webId);
      return null;
    }
  }
}

export async function getInboxUrl(webId: string) {
  const profileDoc = await fetchDocument(webId)
  const profile = profileDoc.getSubject(webId);
  const inboxUrl = profile.getNodeRef(ldp.inbox);
  return inboxUrl;
}

async function getContainerItems(containerUrl: string): Promise<string[]> {
  const containerDoc = await fetchDocument(containerUrl);
  const containerNode = containerDoc.getSubject('');
  return containerNode.getAllNodeRefs(ldp.contains);
}

export async function getFriendRequestsFromInbox(webId: string): Promise<PersonData[]> {
  const inboxUrl = await getInboxUrl(webId);
  if (!inboxUrl) {
    return [];
  }
  const inboxItems = await getContainerItems(inboxUrl)
  return Promise.all(inboxItems.map(async (url: string) => {
    const obj = new PersonData();
    obj.url =  url;
    await obj.fetchAndParse();
    await obj.fetchProfile();
    return obj;
  }));
}

async function removeRemoteDoc(url: string) {
  await SolidAuth.fetch(url, {
    method: 'DELETE'
  });
}

async function removeFriendRequest(obj: PersonData) {
  if (obj.url) {
    await removeRemoteDoc(obj.url);
  }
}

async function addFriend(webId: string) {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession || !currentSession.webId) {
    throw new Error('cannot add friend, you are not logged in!');
  }

  // Find a Document that lists vcard:Individual's
  const addressBookDocument = await fetchDocumentForClass(vcard.Individual);
  if (!addressBookDocument) {
    throw new Error('cannot add friend, you do not have a Friends addressbook yet!');
  }
  const groups = addressBookDocument.getSubjectsOfType(vcard.Group);
  const friendsGroup = groups.find((group: TripleSubject) => {
    const groupName = group.getString(vcard.fn);
    return (groupName === 'Friends');
  });
  if (!friendsGroup) {
    throw new Error('you have an addressbook but no Friends group!');
  }
  friendsGroup.addNodeRef(vcard.hasMember, webId);
  await addressBookDocument.save();
}

async function accept(obj: PersonData) {
  if (!obj.webId) {
    throw new Error('webId unknown from friend request!')
  }
  await addFriend(obj.webId);
  await removeFriendRequest(obj);
}

async function reject(obj: PersonData) {
  await removeFriendRequest(obj);
}

export const IncomingList: React.FC = () => {
  const webId = useWebId();
  const [friendRequests, setFriendRequests] = React.useState<Array<PersonData>>();
  const [friendRequestsToAccept, setFriendRequestsToAccept] = React.useState<Array<PersonData>>([]);
  const [friendRequestsToReject, setFriendRequestsToReject] = React.useState<Array<PersonData>>([]);

  function queueAcceptation(obj: PersonData) {
    setFriendRequestsToAccept((arr) => arr.concat(obj));
  }

  React.useEffect(() => {
    if (friendRequestsToAccept.length) {
      Promise.all(friendRequestsToAccept.map((item) => accept(item))).then(() => {
        setFriendRequestsToAccept([]);
        updateList();
        window.location.href = '';
      })
    }
  }, [friendRequestsToAccept]);

  function queueRejection(obj: PersonData) {
    setFriendRequestsToReject((arr) => arr.concat(obj));
  }
  React.useEffect(() => {
    if (friendRequestsToReject.length) {
      Promise.all(friendRequestsToReject.map((item) => reject(item))).then(() => {
        setFriendRequestsToReject([]);
        updateList();
        window.location.href = '';
      })
    }
  }, [friendRequestsToReject]);

  async function updateList () {
    if (webId) {
      await getFriendRequestsFromInbox(webId).then((friendRequestObjs) => {
        let filtered: PersonData[] = [];
        friendRequestObjs.forEach(obj => {
          if (!!obj.webId) {
            if (!obj.name) {
              obj.name = obj.webId;
            }
            if (!obj.picture) {
              obj.picture = 'https://melvincarvalho.github.io/solid-profile/images/profile.png'
            }
            filtered.push(obj);
          }
        });
        setFriendRequests(filtered);
      });
    }
  };
  function updateListSync() {
    updateList();
  }
  React.useEffect(updateListSync, [webId]);

  return <>
    {friendRequests ?
      (friendRequests.length ?
        friendRequests.map((item, index) => (
        <li key={item.url}>
          <p>Friend request from "{item.name}"</p>
          <figure className="image is-128x128">
            <img src={item.picture || ''}/>
          </figure>
          <input type="hidden" name="webId" value="{item.webId}"/>
          <button type="submit" className='button is-primary' onClick={() => queueAcceptation(item)}>Accept</button>
          <button type="submit" className='button is-warning' onClick={() => queueRejection(item)}>Reject</button>
        </li>
        )) : 'Inbox zero :)'
      ) : 'Loading friend requests ...'}
  </>;
};
