import React from 'react';
import { TripleSubject } from 'tripledoc';
import { getFriendLists } from '../services/getFriendList';
import { useWebId } from '@solid/react';
import { Friendlist } from './Friendlist';

export const FriendLists: React.FC = () => {
  const webId = useWebId();
  const [friendLists, setFriendlists] = React.useState<TripleSubject[]>();

  React.useEffect(() => {
    // Only fetch friend lists when someone is logged in
    if (!webId) {
      return;
    }

    getFriendLists().then((friendLists) => {
      if (!friendLists) {
        return;
      }
      setFriendlists(friendLists);
    });
  }, [webId]);

  if (!friendLists) {
    return <>
      Loading&hellip;
    </>;
  }

  const friendListElements = friendLists.map((friendlist, i) => <Friendlist key={'friendlist' + i} friendlist={friendlist}/>);

  return <>
    <section className="section">
      {friendListElements}
    </section>
  </>;
};
