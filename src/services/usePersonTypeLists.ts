import { PersonType, getPersonDetails, PersonDetails } from "./usePersonDetails";
import SolidAuth from 'solid-auth-client';
import { useEffect } from "react";
import React from "react";
import { useWebId } from "@solid/react";
import { getIncomingFriendRequests, IncomingFriendRequest } from "./useIncomingFriendRequests";

export type PersonTypeLists = {
  [type in PersonType]: {
    [webId: string]: PersonDetails;
  }
};

async function getMyWebId(): Promise<string | null> {
  const currentSession = await SolidAuth.currentSession();
  return (currentSession && currentSession.webId) || null;
}

async function getIncoming(webId: string): Promise<string[]> {
  const reqs: IncomingFriendRequest[] = await getIncomingFriendRequests(webId);
  return reqs.map((req: IncomingFriendRequest) => req.webId);
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
  const [batch, setBatch] = React.useState<string[]>([]);
  const me: string | null = useWebId() || null;

  let batchNo = 0;
  useEffect(() => {
    if (batch.length) {
      const thisBatchNo = batchNo++;
      console.log(`Batch ${thisBatchNo}, considering ${batch.length} webId's`, batch);
      Promise.all(batch.map(considerWebId)).then(() => {
        console.log(`Finished batch ${thisBatchNo}`);
      });
    }
    async function considerWebId(webId: string) {
      console.log('looking up', webId);
      const personDetails = await getPersonDetails(webId);
      console.log('looked up', webId, personDetails);
      if (personDetails && personDetails.personType) {
        if (!lists[personDetails.personType][personDetails.webId]) {
          lists[personDetails.personType][personDetails.webId] = personDetails;
          if (personDetails.follows) {
            setBatch(personDetails.follows);
          }
        }
      }
    }
  }, [batch]);
  useEffect(() => {
    console.log('logged in user changed', me);
    (async function getAll() {
      // there are two starting points: the current user, and the inbox.
      // from there, keep looking at friends to discover more.
      if (!me) {
        return;
      }
      setBatch([me].concat(await getIncoming(me)));
    })();
  }, [me]);
  console.log(lists);
  return lists;
}