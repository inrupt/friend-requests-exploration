import React, { useEffect } from 'react';
import { fetchDocument, TripleSubject } from 'tripledoc';
import { foaf, vcard } from 'rdf-namespaces';
import { Link } from 'react-router-dom';
import { useWebId } from '@solid/react';
import { getFriendListsForWebId, AddressBook } from '../services/getFriendListForWebId';
import { getInboxUrl, getFriendRequestsFromInbox, FriendRequestData } from './IncomingList';
import { getFriendLists } from '../services/getFriendList';

interface Props {
  webId: string;
};

export const Person: React.FC<Props> = (props) => {
  const [friendSubject, setFriendSubject] = React.useState();

  React.useEffect(() => {
    fetchDocument(props.webId).then((friendDoc) => {
      setFriendSubject(friendDoc.getSubject(props.webId));
    });
  }, [props.webId]);

  const personView = (friendSubject)
    ? <PersonView subject={friendSubject}/>
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
    case PersonType.requester: return <>(accept) (reject)</>;
    case PersonType.requested: return <>(resend)</>;
    case PersonType.friend: return <>(you are friends)</>;
    case PersonType.blocked: return <>(unblock)</>;
    case PersonType.stranger: return <>(befriend)</>;
  }
}

const FriendsInCommon: React.FC<{ personWebId: string }> = (props) => {
  return <>(friends in common)</>;
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

const PersonView: React.FC<{ subject: TripleSubject }> = (props) => {
  const profile = props.subject;
  const personWebId = props.subject.asNodeRef();
  const webId = useWebId();

  const listsYou = useAsync(async () => {
    if (webId) {
      const friendList: AddressBook[] | null = await getFriendListsForWebId(personWebId);
      if (friendList) {
        friendList.forEach((addressBook: AddressBook) => {
          if (addressBook.contacts.indexOf(webId) !== -1) {
            return true;
          }
        });
      }
    }
    return false;
  }, false);

  const isInInbox = useAsync(async () => {
    if (webId) {
      const friendRequests: FriendRequestData[] = await getFriendRequestsFromInbox(webId);
      friendRequests.forEach((friendRequest: FriendRequestData) => {
        if (friendRequest.webId === personWebId) {
          return true;
        }
      });
    }
    return false;
  }, false);

  const isInYourList = useAsync(async () => {
    if (webId) {
      const friendLists: TripleSubject[] | null = await getFriendLists();
      if (friendLists) {
        friendLists.forEach((friendList) => {
          const contacts = friendList.getAllNodeRefs(vcard.hasMember);
          if (contacts.indexOf(webId) !== -1) {
            return true;
          }
        });
      }
    }
    return false;
  }, false);

  let personType: PersonType = PersonType.stranger;
  if (personWebId === webId) {
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
        <p className="content">
          <Link
            to={`/profile/${encodeURIComponent(profile.asNodeRef())}`}
            title="View this person's friends"
          >
            {profile.getLiteral(foaf.name) || profile.getLiteral(vcard.fn) || profile.asNodeRef()}
          </Link>
          <PersonActions personType={personType} personWebId={props.subject.asNodeRef()}></PersonActions>
          <FriendsInCommon personWebId={props.subject.asNodeRef()}></FriendsInCommon>
        </p>
      </div>
    </div>
  </>;
};
