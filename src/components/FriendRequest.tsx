import React from 'react';
import { TripleSubject, Reference } from 'tripledoc';
import { schema, vcard, foaf } from 'rdf-namespaces';
import { useProfile } from '../services/old/useProfile-old';
import { IncomingFriendRequest } from '../services/useIncomingFriendRequests';
import { usePersonDetails } from '../services/usePersonDetails';

interface Props {
  request: IncomingFriendRequest | null;
  onAccept: (req: IncomingFriendRequest) => void;
  onReject: (req: IncomingFriendRequest) => void;
};
export const FriendRequest: React.FC<Props> = (props) => {
  const profile = usePersonDetails(props.request ? props.request.webId : null)
  if (profile === null) {
    return (
      <p className="subtitle">
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
            src={profile.avatarUrl || 'https://melvincarvalho.github.io/solid-profile/images/profile.png'}
            alt=""
          />
        </figure>
      </div>
      <div className="media-body content">
        <h3 className="subtitle is-5">
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
