import React from 'react';
import { TripleSubject } from 'tripledoc';
import { vcard } from 'rdf-namespaces';
import { FriendSelector } from './FriendSelector';
import { Friend } from './Friend';
import SolidAuth from 'solid-auth-client';
import { getInboxUrl } from './IncomingList'
import { Person } from './Person';

interface Props {
  friendlist: TripleSubject;
};

async function sendFriendRequest(webId: string) {
  const inboxUrl = await getInboxUrl(webId);
  if (!inboxUrl) {
    throw new Error('friend has no inbox?');
  }
  SolidAuth.fetch(inboxUrl, {
    method: 'POST',
    body: '(todo)'
  });
}

export const Friendlist: React.FC<Props> = (props) => {
  const [addedFriends, setAddedFriends] = React.useState<string[]>([]);
  const [storedFriends, setStoredFriends] = React.useState<string[]>([]);

  React.useEffect(() => {
    const friendsToAdd = addedFriends.filter(friend => !storedFriends.includes(friend));
    if (friendsToAdd.length === 0) {
      return;
    }
    friendsToAdd.forEach((friend) => {
      props.friendlist.addNodeRef(vcard.hasMember, friend);
      sendFriendRequest(friend).then(() => {
        console.log('Friend request sent', friend);
      });
    });
    props.friendlist.getDocument().save().then(() => {
      setStoredFriends(friends => friends.concat(friendsToAdd));
    });
  }, [addedFriends, storedFriends, props.friendlist]);

  const friends = props.friendlist.getAllNodeRefs(vcard.hasMember);
  const friendElements = React.useMemo(() => {
    return (friends.length === 0)
      ? <p>You have not added any friends yet :(</p>
      : friends.map(getPersonCard)
      // We want to re-run this when `storedFriends` changes,
      // because `getAllNodeRefs` will then report new values,
      // even though it's still the same instance (i.e. it's not immutable):
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedFriends, friends]);

  const onAddFriend = (webId: string) => {
    setAddedFriends(friends => friends.concat(webId));
  };

  return <>
    <h2 className="title">
      {props.friendlist.getLiteral(vcard.fn)}
    </h2>
    <section className="section">
      {friendElements}
    </section>
    <section className="section">
      <FriendSelector onSelect={onAddFriend}/>
    </section>
  </>;
};

function getPersonCard(webId: string): React.ReactElement {
  return <>
    <div key={webId} className="card">
      <div className="section">
        <Person webId={webId}/>
      </div>
    </div>
  </>;
}
