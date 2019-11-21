import React from 'react';
import { FriendSelector } from './FriendSelector';
import { Person } from './Person';
import { sendFriendRequest } from '../services/sendActionNotification';
import { usePersonDetails } from '../services/usePersonDetails';
import { useWebId } from '@solid/react';


export const FriendList: React.FC<{}> = () => {
  const webId: string | null = useWebId() || null;
  const myDetails = usePersonDetails(webId);
  if (!myDetails) {
    return <>Loading...</>;
  }
  const friendElements = (myDetails.friends.length === 0)
    ? <p>You have not added any friends yet :(</p>
    : myDetails.friends.map(getPersonCard);

  const onAddFriend = (webId: string) => {
    sendFriendRequest(webId).then(() => {
      window.alert('Friend request sent ' + webId);
    }).catch((e) => {
      console.error(e);
      window.alert('Could not send friend request ' + webId);
    });
  };

  return <>
    <h2 className="title">
      Friends
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
