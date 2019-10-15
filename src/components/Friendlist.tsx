import React from 'react';
import { TripleSubject } from 'tripledoc';
import { vcard } from 'rdf-namespaces';
import { FriendSelecter } from './FriendSelecter';
import { Friend } from './Friend';

interface Props {
  friendlist: TripleSubject;
};

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
    });
    props.friendlist.getDocument().save().then(() => {
      setStoredFriends(friends => friends.concat(friendsToAdd));
    });
  }, [addedFriends, storedFriends, props.friendlist]);

  const friends = props.friendlist.getAllNodeRefs(vcard.hasMember);
  const friendElements = React.useMemo(() => {
    return (friends.length === 0)
      ? <p>You have not added any friends yet :(</p>
      : friends.map((webId) => <Friend key={webId} webId={webId}/>)
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
      <FriendSelecter onSelect={onAddFriend}/>
    </section>
  </>;
};
