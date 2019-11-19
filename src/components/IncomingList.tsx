import React from 'react';
import { useWebId } from '@solid/react';
import { TripleSubject, Reference, TripleDocument } from 'tripledoc';
import { schema, vcard, ldp } from 'rdf-namespaces';
import SolidAuth from 'solid-auth-client';
import { getIncomingRequests } from '../services/old/getIncomingRequests-old';
import { FriendRequest } from './FriendRequest';
import { getFriendLists } from '../services/old/getFriendList-old';
import { sendConfirmation } from '../services/sendActionNotification';
import { useDocument } from '../services/DocumentCache';

async function removeRemoteDoc(url: string) {
  return await SolidAuth.fetch(url, {
    method: 'DELETE'
  });
}

export const IncomingList: React.FC = () => {
  const incomingFriendRequests: IncomingFriendRequest[] | null = useIncomingFriendRequests();

  
  const [friendRequests, setFriendRequests] = React.useState<TripleSubject[]>();
  const [friendlists, setFriendlists] = React.useState<TripleSubject[] | null>();

  React.useEffect(() => {
    getIncomingRequests().then(setFriendRequests);
    getFriendLists().then(setFriendlists);
  }, [webId]);

  if (!friendRequests || !friendlists) {
    return (
      <p className="subtitle">Loading friend requests&hellip;</p>
    );
  }

  function acceptRequest(request: TripleSubject, targetList: Reference) {
    if (!friendlists) {
      throw new Error('Cannot accept the request because we cannot find your friend lists.');
    }

    const agentRef = request.getRef(schema.agent);
    if (!agentRef) {
      throw new Error('The friend request was malformed and could not be accepted.');
    }

    const friendlist = friendlists.find(list => list.asRef() === targetList);
    if (!friendlist) {
      throw new Error('Could not find the selected friend list.');
    }

    friendlist.addRef(vcard.hasMember, agentRef);
    friendlist.getDocument().save().then((updatedList) => {
      const newFriendlists = [...friendlists];
      newFriendlists[friendlists.indexOf(friendlist)] = updatedList.getSubject(friendlist.asRef());
      setFriendlists(newFriendlists);
      removeRemoteDoc(request.getDocument().asRef());
      sendConfirmation(agentRef);
    });
  }

  function rejectRequest(request: TripleSubject) {
    removeRemoteDoc(request.getDocument().asRef()).then(() => {
      setFriendRequests(oldRequests => (oldRequests || []).filter(oldRequest => oldRequest !== request));
    });
  }

  const requestElements = friendRequests.map((request) => {
    return (
      <FriendRequest
        key={request.asRef()}
        request={request}
        friendlists={friendlists}
        onAccept={(targetList) => acceptRequest(request, targetList)}
        onReject={() => rejectRequest(request)}
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
