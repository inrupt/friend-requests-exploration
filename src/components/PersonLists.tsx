import React from 'react';
import { Link } from 'react-router-dom';
import SolidAuth, { Session } from 'solid-auth-client';
import { useWebId } from '@solid/react';
import { vcard } from 'rdf-namespaces';
import { getDocument } from '../services/DocumentCache';
import { sendConfirmation } from '../services/sendActionNotification';
import { getFriendsGroupRef, PersonDetails, PersonType } from '../services/usePersonDetails';
import { IncomingFriendRequest, useIncomingFriendRequests, removeRemoteDoc } from '../services/useIncomingFriendRequests';
import { usePersonTypeLists, PersonTypeLists } from '../services/usePersonTypeLists';
import { Person } from 'rdf-namespaces/dist/foaf';

interface PersonProps {
  details: PersonDetails
}



export const PersonSummary: React.FC<PersonProps> = (props) => {
  const details = props.details;
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
}

function getPersonCard(personDetails: PersonDetails): React.ReactElement {
  return (
    <div key={personDetails.webId} className="card">
      <div className="section">
        <PersonSummary details={personDetails}/>
      </div>
    </div>
  );
}

export const TypeList: React.FC<{ list: { [webId: string]: PersonDetails }, header: string }> = ({ list, header }) => {
  if (Object.keys(list).length === 0) {
    return <></>;
  }

  return <div>
    <p className="panel-heading">
      {header}
    </p>
    <div className="panel-block">
      {Object.keys(list).map((webId: string) => getPersonCard(list[webId]))}
    </div>
  </div>;
}

export const DiscoverableLists: React.FC<{}> = () => {
  const lists: PersonTypeLists = usePersonTypeLists();
  if (!lists) {
    return <>Loading...</>;
  }

  return <div className="menu-list">
    <nav className="panel">
      <TypeList header="Inbox" list={lists[PersonType.requester]} />
    </nav>
    <nav className="panel">
      <TypeList header="Outbox" list={lists[PersonType.requested]} />
    </nav>
    <nav className="panel">
      <TypeList header="Friends" list={lists[PersonType.friend]} />
    </nav>
    <nav className="panel">
      <TypeList header="Blocked" list={lists[PersonType.blocked]} />
    </nav>
    <nav className="panel">
      <TypeList header="Suggestions" list={lists[PersonType.stranger]} />
    </nav>
  </div>;
}