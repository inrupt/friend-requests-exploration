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
    const webId = session.webId;
    const friendsListRef = await getFriendslistRef(webId);
    const friendsDoc = await getDocument(friendsListRef);
    const friendsSub = friendsDoc.getSubject(friendsListRef);
    friendsSub.addRef(vcard.hasMember, webId);
    await friendsDoc.save();
    await sendConfirmation(webId);
    await removeRemoteDoc(request.inboxItem);
    window.alert('friend added');
  }

  async function onReject(request: IncomingFriendRequest) {
    await removeRemoteDoc(request.inboxItem);
    window.alert('friend added');
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
    <section className="section">
      <h2 className="title">Friend requests</h2>
      {requestElements}
    </section>
  );
};
