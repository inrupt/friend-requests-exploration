import React from 'react';
import { useParams } from 'react-router';
import { NodeRef } from 'tripledoc';
import { getFriendListsForWebId } from '../services/getFriendListForWebId';
import { Person } from './Person';

interface PathParams {
  webId: string;
};

export function usePersonFriends(webId: string | null) {
  const [personFriends, setPersonFriends] = React.useState<Set<NodeRef> | null>();

  React.useEffect(() => {
    getFriendListsForWebId(webId).then(friendLists => {
      if (friendLists === null) {
        setPersonFriends(null);
        return;
      }

      setPersonFriends(friendLists.reduce((friends, list) => {
        list.contacts.forEach(friendRef => friends.add(friendRef));
        return friends;
      }, new Set<NodeRef>()));
    });
  }, [webId]);
  return personFriends;
}

export const Profile: React.FC = (props) => {
  const params = useParams<PathParams>();
  const webId = decodeURIComponent(params.webId);
  const theirFriends = usePersonFriends(webId);

  if (theirFriends === null) {
    return <>
      <section className="section">
        <p className="content">
          This person does not have any friends that are visible to you.
        </p>
      </section>
    </>;
  }

  if (theirFriends === undefined) {
    return <>
      <section className="section">
        <p className="content">
          Loading&hellip;
        </p>
      </section>
    </>;
  }

  const profiles = Array.from(theirFriends.values()).map((friendRef) => {
    return <>
      <section className="section">
        <div key={friendRef} className="card">
          <div className="section">
            <Person webId={friendRef}/>
          </div>
        </div>
      </section>
    </>;
  });

  return <>
    <section className="header">
      <h2>Friends of {webId}:</h2>
    </section>
    {profiles}
  </>;
};
