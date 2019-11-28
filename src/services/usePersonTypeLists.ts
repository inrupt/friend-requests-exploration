import { PersonType, getPersonDetails, PersonDetails } from "./usePersonDetails";
import SolidAuth from 'solid-auth-client';
import { useEffect } from "react";
import React from "react";
import { useWebId } from "@solid/react";

export type PersonTypeLists = {
  [type in PersonType]: {
    [webId: string]: PersonDetails;
  }
};

async function getMyWebId(): Promise<string | null> {
  const currentSession = await SolidAuth.currentSession();
  return (currentSession && currentSession.webId) || null;
}

async function getIncoming(): Promise<string[]> {
  return [];
}

export function usePersonTypeLists(): PersonTypeLists {
  const [lists, setPersonTypeLists] = React.useState<PersonTypeLists>({
    [PersonType.me]: {},
    [PersonType.requester]: {},
    [PersonType.requested]: {},
    [PersonType.friend]: {},
    [PersonType.blocked]: {},
    [PersonType.stranger]: {},
  });
  const [queue, setQueue] = React.useState<string[]>([]);
  const me: string | null = useWebId() || null;

  let batchNo = 0;
  useEffect(() => {
    if (queue.length) {
      const thisBatchNo = batchNo++;
      const batch = [...queue];
      console.log(`Batch ${thisBatchNo}, considering ${queue.length} webId's`, batch);
      setQueue([]);
      Promise.all(batch.map(considerWebId)).then(() => {
        console.log(`Finished batch ${thisBatchNo}`);
      });
    }
    async function considerWebId(webId: string) {
      const personDetails = await getPersonDetails(webId);
      if (personDetails && personDetails.personType) {
        if (!lists[personDetails.personType][personDetails.webId]) {
          lists[personDetails.personType][personDetails.webId] = personDetails;
          if (personDetails.follows) {
            setQueue(queue.concat(personDetails.follows));
          }
        }
      }
    }
  }, [queue]);
  useEffect(() => {
    console.log('logged in user changed', me);
    (async function getAll() {
      // there are two starting points: the current user, and the inbox.
      // from there, keep looking at friends to discover more.
      if (!me) {
        return;
      }
      setQueue([me].concat(await getIncoming()));
    })();
  }, [me]);
  return lists;
}