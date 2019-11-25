import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWebId } from '@solid/react';
import { addFriend } from '../services/sendActionNotification';
import { PersonDetails, usePersonDetails } from '../services/usePersonDetails';

interface Props {
  webId?: string;
};

export const MainPanel: React.FC<Props> = () => {
  const params = useParams<{ webId: string }>();
  const webId = decodeURIComponent(params.webId);
  return <Person webId={webId} />;
}
export const Person: React.FC<Props> = (props) => {
    let details: PersonDetails | null | undefined = usePersonDetails(props.webId || null);
  const personView = (details)
    ? <FullPersonView details={details}/>
      : <code>{props.webId}</code>;
  return <>
    {personView}
  </>;
};

export const PersonSummary: React.FC<Props> = (props) => {
  const details = usePersonDetails(props.webId || null);

  const personView = (details)
    ? <PersonSummaryView details={details}/>
      : <code>{props.webId}</code>;
  return <>
    {personView}
  </>;
};

enum PersonType {
  me,
  requester,
  requested,
  friend,
  blocked,
  stranger
}

const PersonActions: React.FC<{ personType: PersonType, personWebId: string }> = (props) => {
  switch (props.personType) {
    case PersonType.me: return <>(this is you)</>;
    case PersonType.requester: return <>
      <button type="submit" className='button is-primary' onClick={() => {
        window.location.href = '';
      }}>See Friend Request</button>
    </>;
    case PersonType.requested: return <>
      <button type="submit" className='button is-warning' onClick={() => addFriend(props.personWebId)}>Resend</button>
    </>;
    case PersonType.friend: return <>
      <button type="submit" className='button is-danger' onClick={() => {
        // unFriend(props.personWebId).then(() => {
        //   console.log('unfriended', props.personWebId);
        //   window.location.href = '';  // FIXME: more subtle way to tell React to re-render
        // }, (e: Error) => {
        //   console.log('could not unfriend', props.personWebId, e.message);
        // });
    }}>Unfriend</button>
    </>;
    case PersonType.blocked: return <>(unblock)</>;
    case PersonType.stranger: return <>
      <button type="submit" className='button is-primary' onClick={() => addFriend(props.personWebId)}>Befriend</button>
    </>;
  }
}


const FriendsInCommon: React.FC<{ personWebId: string }> = (props) => {
  const webId = useWebId();
  const theirDetails = usePersonDetails(props.personWebId);
  const myDetails = usePersonDetails(webId || null);
  // console.log({ webId, theirDetails, myDetails });
  if (theirDetails && myDetails) {
    if (theirDetails.friends === null || myDetails.friends === null) {
      return <>(could not display friends in common)</>;
    }
    // help TypeScript to realize this is now non-null:
    const myFriends: string[] = myDetails.friends;
    const friendsInCommon: string[] = theirDetails.friends.filter(item => myFriends.indexOf(item) !== -1);
    const listElements = friendsInCommon.map(webId => <li key={webId}> {webId}</li> );

    return ( 
      <div className="media">
       <div className="media-left">
       <p><strong>Friends in common: </strong> </p>

       <div className="media-content">{listElements}</div>
       </div>
      </div>
      );
  }
  return <>(no friends in common)</>;
}

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

const FullPersonView: React.FC<{ details: PersonDetails}> = ({ details }) => {
  if (details.personType === null) {
    return <>(loading {details.webId})</>;
  }
  const photo = <>
    <figure className="media-left">
      <p className="image is-64x64">
        <img src={details.avatarUrl || '/img/default-avatar.png'} alt="Avatar" className="is-rounded"/>
      </p>
    </figure>
  </>;

  return <>
    <header className="card-header">
      <div className="card-header-title">
      {photo}
          <div>
            <Link
              to={`/profile/${encodeURIComponent(details.webId)}`}
              title="View this person's friends"
            >
              {details.fullName}
            </Link>
          </div>
       </div>
     </header>  
     <div className="card-content">
       <div className="content">  
          <div>
            <PersonActions personType={details.personType} personWebId={details.webId}></PersonActions>
          </div>
          <div>
            <FriendsInCommon personWebId={details.webId}></FriendsInCommon>
          </div>         
        </div>
      </div>         


  </>;
};
