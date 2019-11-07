import React from 'react';
import { useParams } from 'react-router';
import { NodeRef } from 'tripledoc';
import { getFriendListsForWebId } from '../services/getFriendListForWebId';
import { Person } from './Person';

interface PathParams {
  webId: string;
};

export const Profile: React.FC = (props) => {
  const params = useParams<PathParams>();
  const webId = decodeURIComponent(params.webId);

  const [metaFriends, setMetaFriends] = React.useState<NodeRef[] | null>();

  React.useEffect(() => {
    getFriendListsForWebId(webId).then(friendLists => {
      if (friendLists === null) {
        setMetaFriends(null);
        return;
      }

      const theirFriends = friendLists.reduce((friends, list) => {
        list.contacts.forEach(friendRef => friends.add(friendRef));
        return friends;
      }, new Set<NodeRef>());

      setMetaFriends(Array.from(theirFriends.values()));
    });
  }, [webId]);

  if (metaFriends === null) {
    return <>
      <section className="section">
        <p className="content">
          This person does not have any friends that are visible to you.
        </p>
      </section>
    </>;
  }

  if (metaFriends === undefined) {
    return <>
      <section className="section">
        <p className="content">
          Loading&hellip;
        </p>
      </section>
    </>;
  }

  const profiles = metaFriends.map((friendRef) => {
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
