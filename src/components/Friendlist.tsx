import React from 'react';
import { TripleSubject } from 'tripledoc';
import { vcard } from 'rdf-namespaces';
import { FriendSelector } from './FriendSelector';
import { Person } from './Person';
import { sendBefriendActionNotification } from '../services/sendFriendRequest';

interface Props {
  friendlist: TripleSubject;
};

export const Friendlist: React.FC<Props> = (props) => {
  const [addedFriends, setAddedFriends] = React.useState<string[]>([]);
  const [storedFriendList, setStoredFriendlist] = React.useState(props.friendlist);

  const friends = storedFriendList.getAllNodeRefs(vcard.hasMember);
  React.useEffect(() => {
    const friendsToAdd = addedFriends.filter(friend => !friends.includes(friend));
    if (friendsToAdd.length === 0) {
      return;
    }
    friendsToAdd.forEach((friend) => {
      storedFriendList.addRef(vcard.hasMember, friend);
      sendBefriendActionNotification(friend).then(() => {
        console.log('Friend request sent', friend);
      });
    });
    storedFriendList.getDocument().save().then((storedFriendlistDoc) => {
      setStoredFriendlist(storedFriendlistDoc.getSubject(storedFriendList.asRef()));
    });
  }, [storedFriendList, addedFriends, friends]);

  const friendElements = (friends.length === 0)
    ? <p>You have not added any friends yet :(</p>
    : friends.map(getPersonCard);

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
  return (
    <div key={webId} className="card">
      <div className="section">
        <Person webId={webId}/>
      </div>
    </div>
  );
}
