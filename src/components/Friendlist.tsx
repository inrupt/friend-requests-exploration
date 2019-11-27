import React from 'react';
import { TripleSubject } from 'tripledoc';
import { vcard } from 'rdf-namespaces';
import { FriendSelector } from './FriendSelector';
import { Person } from './Person';
import { sendFriendRequest } from '../services/sendFriendRequest';

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
      sendFriendRequest(friend).then(() => {
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

  return (
    <div>
      <div className="panel-heading">
        {props.friendlist.getLiteral(vcard.fn)}
      </div>
      <div className="panel-block">
        {friendElements}
      </div>
      <div className="panel-block">
        <FriendSelector onSelect={onAddFriend}/>
      </div>
    </div>
    );
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
