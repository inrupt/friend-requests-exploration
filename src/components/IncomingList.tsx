import React from 'react';
import { useWebId } from '@solid/react';
import { fetchDocument, TripleDocument } from 'tripledoc';
import { ldp, schema, vcard } from 'rdf-namespaces';

class FriendRequestData {
  url: string
  webId?: string
  name?: string | null
  picture?: string | null
  constructor(url: string) {
    this.url = url;
  }
  async fetchAndParse() {
    const doc = await fetchDocument(this.url);
    if (doc !== null) {
      const subjects = doc.getSubjectsOfType(schema.BefriendAction)
      subjects.forEach((subject) => {
        const agent = subject.getNodeRef(schema.agent);
        // console.log('got subject!', subject, agent);
        if (typeof agent === 'string') {
          this.webId = agent;
        }
      });
    }
  }
  async fetchProfile() {
    if (!this.webId) {
      return;
    }
    try {
      console.log('fetching', this.webId)
      const profileDoc = await fetchDocument(this.webId);
      const sub = profileDoc.getSubject(this.webId)
      this.name = sub.getString(vcard.fn)
      this.picture = sub.getNodeRef(vcard.hasPhoto)
      console.log('fetched', this.webId, this.name, this.picture);
    } catch (e) {
      console.error('failed to fetch profile for friend request', this.webId);
      return null;
    }
  }
}
async function getInboxUrl(webId: string) {
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

async function getFriendRequestsFromInbox(webId: string): Promise<FriendRequestData[]> {
  const inboxUrl = await getInboxUrl(webId);
  if (!inboxUrl) {
    return [];
  }
  const inboxItems = await getContainerItems(inboxUrl)
  return Promise.all(inboxItems.map(async (url: string) => {
    const obj = new FriendRequestData(url);
    await obj.fetchAndParse();
    await obj.fetchProfile();
    return obj;
  }));
}

function accept(obj: FriendRequestData) {
  console.log('accept!', obj);
}

function reject(obj: FriendRequestData) {
  console.log('reject!', obj);
}

export const IncomingList: React.FC = () => {
  const webId = useWebId();
  const [friendRequests, setFriendRequests] = React.useState<Array<FriendRequestData>>();

  React.useEffect(() => {
    if (webId) {
      getFriendRequestsFromInbox(webId).then((friendRequestObjs) => {
        let filtered: FriendRequestData[] = [];
        friendRequestObjs.map(obj => {
          console.log('got requester profile', obj)
          if ((!!obj.name) && (!!obj.picture) && (!!obj.webId)) {
            filtered.push(obj);
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
        <p>Friend request from "{item.name}"</p>
        <figure className="image is-128x128">
          <img src={item.picture || ''}/>
        </figure>
        <input type="hidden" name="webId" value="{item.webId}"/>
        <button type="submit" className='button is-primary' onClick={() => accept(item)}>Accept</button>
        <button type="submit" className='button is-warning' onClick={() => reject(item)}>Reject</button>
      </li>
      )
    ) : 'Inbox zero :)'}
  </>;
};
