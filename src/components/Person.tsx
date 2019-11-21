import React, { useEffect } from 'react';
import { TripleSubject } from 'tripledoc';
import { foaf, vcard, schema } from 'rdf-namespaces';
import { Link } from 'react-router-dom';
import { useWebId } from '@solid/react';
import { getFriendListsForWebId, AddressBookGroup } from '../services/old/getFriendListForWebId-old';
import { getFriendLists, unFriend } from '../services/old/getFriendList-old';
import { useProfile } from '../services/old/useProfile-old';
import { sendFriendRequest } from '../services/sendActionNotification';
import { getIncomingRequests } from '../services/old/getIncomingRequests-old';
import { PersonDetails, usePersonDetails } from '../services/usePersonDetails';

interface Props {
  webId?: string;
};

export const Person: React.FC<Props> = (props) => {
  let details: PersonDetails | null = usePersonDetails(props.webId || null);
  const personView = (details)
    ? <FullPersonView details={details}/>
      : <code>{props.webId}</code>;
  return <>
    {personView}
  </>;
};

export const PersonSummary: React.FC<Props> = (props) => {
  let profile: TripleSubject | null = useProfile(props.webId || null);

  const personView = (profile)
    ? <PersonSummaryView subject={profile}/>
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
      <button type="submit" className='button is-warning' onClick={() => sendFriendRequest(props.personWebId)}>Resend</button>
    </>;
    case PersonType.friend: return <>
      <button type="submit" className='button is-danger' onClick={() => {
        unFriend(props.personWebId).then(() => {
          console.log('unfriended', props.personWebId);
          window.location.href = '';  // FIXME: more subtle way to tell React to re-render
        }, (e: Error) => {
          console.log('could not unfriend', props.personWebId, e.message);
        });
    }}>Unfriend</button>
    </>;
    case PersonType.blocked: return <>(unblock)</>;
    case PersonType.stranger: return <>
      <button type="submit" className='button is-primary' onClick={() => sendFriendRequest(props.personWebId)}>Befriend</button>
    </>;
  }
}


const FriendsInCommon: React.FC<{ personWebId: string }> = (props) => {
  const webId = useWebId();
  const theirDetails = usePersonDetails(props.personWebId);
  const myDetails = usePersonDetails(webId || null);
  console.log({ webId, theirDetails, myDetails });
  if (theirDetails && myDetails) {
    const friendsInCommon: string[] = theirDetails.friends.filter(item => myDetails.friends.indexOf(item) !== -1);
    const listElements = friendsInCommon.map(webId => <li key={webId}> {webId}</li> );

    return <>Friends in common: <ul>{listElements}</ul></>;
  }
  return <>(no friends in common)</>;
}

function useAsync(fun: () => Promise<any>, defaultVal: any) {
  const [val, setVal] = React.useState(defaultVal);
  useEffect(() => {
    fun().then((val) => {
      setVal(val);
    });
  });
  return val;
}

function usePersonType(personWebId: string): PersonType | null {
  const userWebId = useWebId();
  const listsYou = useAsync(async () => {
    let found = false;
    if (userWebId) {
      const friendList: AddressBookGroup[] | null = await getFriendListsForWebId(personWebId);
      if (friendList) {
        friendList.forEach((addressBook: AddressBookGroup) => {
          if (addressBook.contacts.indexOf(userWebId) !== -1) {
            found = true;
          }
        });
      }
    }
    return found;
  }, false);

  const isInInbox = useAsync(async () => {
    let found = false;
    if (userWebId) {
      const friendRequests = await getIncomingRequests();
      return friendRequests.findIndex(request => request.getRef(schema.agent) === personWebId) !== -1;
    }
    return found;
  }, false);

  const isInYourList = useAsync(async () => {
    let found = false;
    if (userWebId) {
      const friendLists: TripleSubject[] | null = await getFriendLists();
      if (friendLists) {
        friendLists.forEach((friendList) => {
          const contacts = friendList.getAllNodeRefs(vcard.hasMember);
          if (contacts.indexOf(personWebId) !== -1) {
            found = true;
            // break;
          }
        });
      }
    }
    return found;
  }, false);
  if (!userWebId) {
    return null;
  }

  console.log({ personWebId, isInYourList, isInInbox, listsYou });
  let personType: PersonType = PersonType.stranger;
  if (personWebId === userWebId) {
    personType = PersonType.me;
  } else if (isInYourList) {
    if (listsYou) {
      personType = PersonType.friend
    } else {
      personType = PersonType.requested
    }
  } else if (isInInbox) {
    personType = PersonType.requested
  }
  return personType;
}
const PersonSummaryView: React.FC<{ subject: TripleSubject }> = (props) => {
  const profile = props.subject;
  const personWebId = props.subject.asNodeRef();
  const personType = usePersonType(personWebId);
  const photoUrl = profile.getNodeRef(vcard.hasPhoto);
  const photo = (!photoUrl)
    ? null
    : <>
        <figure className="media-left">
          <p className="image is-64x64">
            <img src={profile.getNodeRef(vcard.hasPhoto)!} alt="Avatar" className="is-rounded"/>
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
              to={`/profile/${encodeURIComponent(profile.asNodeRef())}`}
              title="View this person's friends"
            >
              {profile.getLiteral(foaf.name) || profile.getLiteral(vcard.fn) || profile.asNodeRef()}
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
        <img src={details.avatarUrl} alt="Avatar" className="is-rounded"/>
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
          <div>
            <PersonActions personType={details.personType} personWebId={details.webId}></PersonActions>
          </div>
          <div>
            <FriendsInCommon personWebId={details.webId}></FriendsInCommon>
          </div>         
        </div>
      </div>
    </div>
  </>;
};
