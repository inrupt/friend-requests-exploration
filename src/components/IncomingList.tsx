import React from 'react';
import { vcard } from 'rdf-namespaces';
import SolidAuth, { Session } from 'solid-auth-client';
import { FriendRequest } from './FriendRequest';
import { sendConfirmation } from '../services/sendActionNotification';
import { getDocument } from '../services/DocumentCache';
import { IncomingFriendRequest, useIncomingFriendRequests } from '../services/useIncomingFriendRequests';
import { getFriendslistRef } from '../services/usePersonDetails';

async function removeRemoteDoc(url: string) {
  return await SolidAuth.fetch(url, {
    method: 'DELETE'
  });
}

export const IncomingList: React.FC = () => {
  const incomingFriendRequests: IncomingFriendRequest[] | null = useIncomingFriendRequests();

  if (!incomingFriendRequests) {
    return (
      <p className="subtitle">Loading friend requests&hellip;</p>
    );
  }

  async function onAccept(request: IncomingFriendRequest) {
    const session: Session | undefined = await SolidAuth.currentSession();
    if (session === undefined) {
      window.alert('not logged in!');
      return;
    }
    const friendsListRef = await getFriendslistRef(session.webId, true);
    if (friendsListRef) {
      const friendsDoc = await getDocument(friendsListRef);
      const friendsSub = friendsDoc.getSubject(friendsListRef);
      friendsSub.addRef(vcard.hasMember, request.webId);
      await friendsDoc.save();
      await sendConfirmation(request.webId);
      await removeRemoteDoc(request.inboxItem);
      window.alert('friend added');
    } else {
      window.alert('friends list not found and creating failed!');
    }
  }

  async function onReject(request: IncomingFriendRequest) {
    await removeRemoteDoc(request.inboxItem);
    window.alert('friend request rejected');
  }

  const requestElements = incomingFriendRequests.map((request) => {
    return (
    // <div>{request.inboxItem} from {request.webId}</div>
      <FriendRequest
        key={request.inboxItem}
        request={request}
        onAccept={onAccept}
        onReject={onReject}
      />
    );
  });

  return (
    <div>
      <p className="panel-heading">Friend requests</p>
      {requestElements}
    </div>
  );
};
