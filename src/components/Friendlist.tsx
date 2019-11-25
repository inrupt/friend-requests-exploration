import React from 'react';
import { PersonSummary } from './Person';
import { sendFriendRequest } from '../services/sendActionNotification';
import { usePersonDetails } from '../services/usePersonDetails';
import { useWebId } from '@solid/react';

export const FriendList: React.FC<{}> = () => {
  const webId: string | null = useWebId() || null;
  const myDetails = usePersonDetails(webId);
  if (!myDetails) {
    return <>Loading...</>;
  }
  if (!myDetails.friends) {
    return <>(failed to retrieve friends list)</>;
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
    <div className="panel-block">
      {friendElements}
    </div>
  </div>;
};

function getPersonCard(webId: string): React.ReactElement {
  return (
    <div key={webId} className="card">
      <div className="section">
        <PersonSummary webId={webId}/>
      </div>
    </div>
  );
}
