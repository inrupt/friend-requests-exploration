import { PersonType, getPersonDetails, PersonDetails } from "./usePersonDetails";
import SolidAuth from 'solid-auth-client';
import { useEffect } from "react";
import React from "react";

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
  // const [queue, setQueue] = React.useState<string[]>([]);

  // useEffect(() => {
  //   async function considerWebId(webId: string) {
  //     const personDetails = await getPersonDetails(webId);
  //     if (personDetails && personDetails.personType) {
  //       if (!lists[personDetails.personType][personDetails.webId]) {
  //         lists[personDetails.personType][personDetails.webId] = personDetails;
  //         if (personDetails.follows) {
  //           setQueue(queue.concat(personDetails.follows));
  //         }
  //       }
  //     }
  //   }
  //   async function getAll() {
  //     // there are two starting points: the current user, and the inbox.
  //     // from there, keep looking at friends to discover more.
  //     const me: string | null = await getMyWebId();
  //     if (me) {
  //       await considerWebId(me);
  //       setQueue(queue.concat(await getIncoming()));
  //       while(queue.length) {
  //         const batch = [...queue];
  //         setQueue([]);
  //         await Promise.all(batch.map(considerWebId));
  //       }
  //     }
  //   }
  //   getAll();
  // });
  return lists;
}