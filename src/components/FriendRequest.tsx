import React from 'react';
import { TripleSubject, Reference } from 'tripledoc';
import { schema, vcard, foaf } from 'rdf-namespaces';
import { useProfile } from '../services/useProfile';

interface Props {
  request: TripleSubject;
  friendlists: TripleSubject[];
  onAccept: (targetList: Reference) => void;
  onReject: () => void;
};
export const FriendRequest: React.FC<Props> = (props) => {
  const agentRef = props.request.getRef(schema.agent);
  // FIXME: use profile of agentRef that may be null
  // if (!agentRef) {
  //   return null;
  // }
  const profile: TripleSubject | null = useProfile(agentRef);

  if (profile === null) {
    return (
      <p className="subtitle">
        There was an error getting the profile details of the person that sent this friend request.
      </p>
    );
  }
  if (typeof profile === 'undefined') {
    return (
      <p className="subtitle">
        Loading&hellip;
      </p>
    );
  }

  function acceptRequest(event: React.FormEvent) {
    event.preventDefault();

    const formElement = event.target as HTMLFormElement;
    const friendlistSelector = formElement.elements.namedItem('list') as HTMLSelectElement;
    props.onAccept(friendlistSelector.value);
  }

  return <>
    <div className="media">
      <div className="media-left">
        <figure className="image is-128x128">
          <img
            src={profile.getRef(vcard.hasPhoto) || 'https://melvincarvalho.github.io/solid-profile/images/profile.png'}
            alt=""
          />
        </figure>
      </div>
      <div className="media-body content">
        <h3 className="subtitle is-5">
          {profile.getString(foaf.name)}
        </h3>
        <form onSubmit={acceptRequest}>
          <div className="field">
            <div className="control">
              <label htmlFor="list" className="label">
                Add to list:
              </label>
              <div className="select">
                <select name="list" id="list">
                  {props.friendlists.map((list) => (<option key={list.asRef()} value={list.asRef()}>{list.getString(vcard.fn)}</option>))}
                </select>
              </div>
            </div>
          </div>
          <div className="field is-grouped">
            <div className="control">
              <button type="submit" onClick={props.onReject} className="button">Reject</button>
            </div>
            <div className="control">
              <button type="submit" className="button is-primary">Accept</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </>;
};
