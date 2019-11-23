import React from 'react';
import { FriendSelector } from './FriendSelector';
import { MainPanel } from './Person';
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

  return <div>
    <p className="panel-heading">
      Friends
    </p>
    <p className="panel-block">
      {friendElements}
    </p>
    <p className="panel-block">
      <FriendSelector onSelect={onAddFriend}/>
    </p>
  </div>;
};

function getPersonCard(webId: string): React.ReactElement {
  return (
    <div key={webId} className="card">
      <div className="section">
        <MainPanel webId={webId}/>
      </div>
    </div>
  );
}
