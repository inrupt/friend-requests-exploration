import { PersonType, getPersonDetails, PersonDetails } from "./usePersonDetails";
import { useEffect } from "react";
import React from "react";
import { useWebId } from "@solid/react";
import { getIncomingFriendRequests, IncomingFriendRequest } from "./useIncomingFriendRequests";

export type PersonTypeLists = {
  [type in PersonType]: {
    [webId: string]: PersonDetails;
  }
};

async function getIncoming(webId: string): Promise<string[]> {
  const reqs: IncomingFriendRequest[] = await getIncomingFriendRequests(webId);
  return reqs.map((req: IncomingFriendRequest) => req.webId);
}

export function usePersonTypeLists(): PersonTypeLists {
  const [lists, setLists] = React.useState<PersonTypeLists>({
    [PersonType.me]: {},
    [PersonType.requester]: {},
    [PersonType.requested]: {},
    [PersonType.friend]: {},
    [PersonType.blocked]: {},
    [PersonType.stranger]: {},
  });
  const [batch, setBatch] = React.useState<string[]>([]);
  const me: string | null = useWebId() || null;

  useEffect(() => {
    if (batch.length) {
      console.log(`Next batch, considering ${batch.length} webId's`, batch);
      Promise.all(batch.map(considerWebId)).then(() => {
        console.log(`Finished batch`, batch);
      });
    }
    async function considerWebId(webId: string) {
      console.log('looking up', webId);
      const personDetails = await getPersonDetails(webId);
      console.log('looked up', webId, personDetails);
      if (personDetails && personDetails.personType) {
        if (!lists[personDetails.personType][personDetails.webId]) {
          lists[personDetails.personType][personDetails.webId] = personDetails;
          setLists(lists);
          if (personDetails.follows) {
            setBatch(personDetails.follows);
          }
        }
      }
    }
  }, [batch, lists]);
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