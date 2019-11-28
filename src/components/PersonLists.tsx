import React from 'react';
import { Link } from 'react-router-dom';
import SolidAuth, { Session } from 'solid-auth-client';
import { useWebId } from '@solid/react';
import { vcard } from 'rdf-namespaces';
import { getDocument } from '../services/DocumentCache';
import { sendConfirmation } from '../services/sendActionNotification';
import { getFriendsGroupRef, PersonDetails } from '../services/usePersonDetails';
import { IncomingFriendRequest, useIncomingFriendRequests, removeRemoteDoc } from '../services/useIncomingFriendRequests';
import { usePersonDetails } from '../services/usePersonDetails';

interface PersonProps {
  webId?: string;
};


const PersonSummaryView: React.FC<{ details: PersonDetails }> = ({ details }) => {
  const photo = <>
    <figure className="card-header-title">
      <p className="image is-48x48">
        <img src={details.avatarUrl || '/img/default-avatar.png'} alt="Avatar" className="is-rounded"/>
      </p>
    </figure>
  </>;

  return <>
    <div className="media">
      {photo}
      <div className="media-content">
        <div className="content">
          <div>
            <Link
              to={`/profile/${encodeURIComponent(details.webId)}`}
              title="View this person's friends"
            >
              {details.fullName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>;
};

export const PersonSummary: React.FC<PersonProps> = (props) => {
  const details = usePersonDetails(props.webId || null);

  const personView = (details)
    ? <PersonSummaryView details={details}/>
      : <code>{props.webId}</code>;
  return <>
    {personView}
  </>;
};

interface FriendRequestProps {
  request: IncomingFriendRequest | null;
  onAccept: (req: IncomingFriendRequest) => void;
  onReject: (req: IncomingFriendRequest) => void;
};
export const FriendRequest: React.FC<FriendRequestProps> = (props) => {
  const profile = usePersonDetails(props.request ? props.request.webId : null)
  if (profile === null) {
    return (
      <p className="subtitle">
        There was an error getting the profile details of the person that sent this friend request.
      </p>
    );
  }
  if (typeof profile === 'undefined') {
    return (
      <p className="panel-block">
        Loading&hellip;
      </p>
    );
  }

  function acceptRequest(event: React.FormEvent) {
    event.preventDefault();
    if (props.request === null) {
      console.error('huh?');
    } else {
      props.onAccept(props.request);
    }
  }

  function rejectRequest(event: React.FormEvent) {
    event.preventDefault();
    if (props.request === null) {
      console.error('huh?');
    } else {
      props.onReject(props.request);
    }
  }

  return <>
    <div className="media">
      <div className="media-left">
        <figure className="image is-128x128">
          <img
            src={profile.avatarUrl || '/img/default-avatar.png'}
            alt=""
          />
        </figure>
      </div>
      <div className="media-body content">
        <h3 className="panel-block is-5">
          {profile.fullName}
        </h3>
        <form>
          <div className="field is-grouped">
            <div className="control">
              <button type="submit" onClick={rejectRequest} className="button">Reject</button>
            </div>
            <div className="control">
              <button type="submit" onClick={acceptRequest} className="button is-primary">Accept</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </>;
};

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
    const friendsGroupRef = await getFriendsGroupRef(session.webId, true);
    if (friendsGroupRef) {
      const friendsDoc = await getDocument(friendsGroupRef);
      const friendsSub = friendsDoc.getSubject(friendsGroupRef);
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

export const DiscoverableLists: React.FC<{}> = () => {
  return <div className="menu-list">
    <nav className="panel">
      <IncomingList />
    </nav>
    <nav className="panel">
      <FriendList />
    </nav>
  </div>;
}