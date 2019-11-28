import React from 'react';
import { TripleSubject } from 'tripledoc';
import { getFriendLists } from '../services/getFriendList';
import { useWebId } from '@solid/react';
import { Friendlist } from './Friendlist';
import { vcard } from 'rdf-namespaces';

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
    return <p className="panel-block">
      Loading friends list&hellip;
    </p>;
  }

  let foundFriends = false;
  const friendListElements = friendLists.map((friendlist, i) => {
    if (friendlist.getLiteral(vcard.fn)) {
      if (!foundFriends) {
        foundFriends = true;
        return <Friendlist key={'friendlist' + i} friendlist={friendlist}/>;
      }
    }
    //Sharon: The code below is causing a key error, commenting it out
    //the app still works atm.  Need to determine what this is doing.
   // return (<div>    </div>);
  });

  return <>
    <div>
      {friendListElements}
    </div>
  </>;
};
