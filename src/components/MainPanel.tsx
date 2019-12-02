import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWebId } from '@solid/react';
import { initiateFriendship, sendConfirmation } from '../services/sendActionNotification';
import { PersonDetails, usePersonDetails, getFriendsGroupRef } from '../services/usePersonDetails';
import { getDocument } from '../services/DocumentCache';
import { vcard } from 'rdf-namespaces';
import { removeAllInboxItems } from '../services/useIncomingFriendRequests';
import { getMyWebId } from '../services/getMyWebId';

interface Props {
  webId?: string;
};

export const MainPanel: React.FC<Props> = () => {
  const params = useParams<{ webId: string }>();
  const webId = decodeURIComponent(params.webId);
  console.log({params, webId });
  let details: PersonDetails | null | undefined = usePersonDetails(webId || null);
  console.log('Person', details, webId);
  const personView = (details)
    ? <FullPersonView details={details}/>
      : <code>{webId}</code>;
  return <>
    {personView}
  </>;
};

const PersonActions: React.FC<{ details: PersonDetails }> = (props) => {
  async function onAccept(event: React.FormEvent) {
    event.preventDefault();
    const myWebId = await getMyWebId();
    if (!myWebId) {
      window.alert('not logged in!');
      return;
    }

    const friendsGroupRef = await getFriendsGroupRef(myWebId, true);
    if (friendsGroupRef) {
      const friendsDoc = await getDocument(friendsGroupRef);
      const friendsSub = friendsDoc.getSubject(friendsGroupRef);
      friendsSub.addRef(vcard.hasMember, props.details.webId);
      await friendsDoc.save();
      await sendConfirmation(props.details.webId);
      await removeAllInboxItems(props.details.webId);
      window.alert('friend added');
    } else {
      window.alert('friends list not found and creating failed!');
    }  
  }

  async function onReject(event: React.FormEvent) {
    event.preventDefault();
    await removeAllInboxItems(props.details.webId);
    window.alert('friend request rejected');
  }
  async function onSend(event: React.FormEvent) {
    console.log("in onSend ");
    event.preventDefault();
    await initiateFriendship(props.details.webId);
    window.alert('friend request sent');
    window.location.href = '/';
  }

  if (props.details.personType) {
    const type: string = props.details.personType;
    console.log('switching on type', type);
    switch (type) {
      case 'me': return <>(this is you)</>;
      case 'requester': return <>
        <button type="submit" className='button is-warning' onClick={onReject}>Reject</button>
        <button type="submit" className='button is-primary' onClick={onAccept}>Accept</button>
      </>;
      case 'requested': return <>
        <button type="submit" className='button is-warning' onClick={onSend}>Resend</button>
      </>;
      case 'friend': return <>
        <button type="submit" className='button is-danger' onClick={() => {
          window.alert('to do: implement');
        }}>Unfriend</button>
      </>;
      case 'blocked': return <>
        <button type="submit" className='button is-danger' onClick={() => {
          window.alert('to do: implement');
        }}>Unblock</button>
      </>;
      case 'stranger': return <>
        <button type="submit" className='button is-primary' onClick={onSend}>Befriend</button>
      </>;
    }
  }
  return <>(no actions)</>;
}


const FriendsInCommon: React.FC<{ details: PersonDetails }> = (props) => {
  const webId = useWebId();
  const theirDetails = props.details;
  const myDetails = usePersonDetails(webId || null);
  console.log("Friends in Common " +  webId + " " + JSON.stringify(theirDetails) + " " + JSON.stringify(myDetails) );
  if (webId === theirDetails.webId) { 
    return <></>;
  } else { 
    if (theirDetails && myDetails) {
      if (theirDetails.follows === null || myDetails.follows === null) {
        return <>(could not display friends in common)</>;
      }
      // help TypeScript to realize this is now non-null:
      const myFriends: string[] = myDetails.follows;
      const friendsInCommon: string[] = theirDetails.follows.filter(item => myFriends.indexOf(item) !== -1);
      const listElements = friendsInCommon.map(webId => {
        return <li key={webId}>
          <Link to={`/profile/${encodeURIComponent(webId)}`}>
            {webId}
          </Link>
        </li>;
      });

      return ( 
        <div className="media">
         <div className="media-left">
         <p><strong>You both follow: </strong> </p>

         <div className="media-content">{listElements}</div>
         </div>
        </div>
        );
    }
    return <>(You follow different people)</>;
  }
}

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
            <PersonActions details={details}></PersonActions>
          </div>
          <div>
            <FriendsInCommon details={details}></FriendsInCommon>
          </div>         
        </div>
      </div>         
  </>;
};
