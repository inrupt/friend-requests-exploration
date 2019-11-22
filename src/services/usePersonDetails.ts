import React from "react";
import { getDocument } from "./DocumentCache";
import { vcard } from "rdf-namespaces";
import { TripleSubject } from "tripledoc";
import { determineUriRef } from "./sendActionNotification";

const as = {
  following: 'https://www.w3.org/TR/activitypub/#following'
};

export enum PersonType {
  me,
  requester,
  requested,
  friend,
  blocked,
  stranger
}

export type PersonDetails = {
  webId: string,
  avatarUrl: string,
  fullName: string,
  friends: string[],
  personType: PersonType
}

export async function getFriendslistRef(webId: string | null, createIfMissing: boolean): Promise<string | null> {
  if (webId === null) {
    return null;
  }
  return determineUriRef(webId, as.following);
}

async function getFriends(webId: string): Promise<string[]> {
  return [];
}

async function getPersonType(webId: string): Promise<PersonType> {
  // function usePersonType(personWebId: string): PersonType | null {
  //   const userWebId = useWebId();
  //   const listsYou = useAsync(async () => {
  //     let found = false;
  //     if (userWebId) {
  //       const friendList: AddressBookGroup[] | null = await getFriendListsForWebId(personWebId);
  //       if (friendList) {
  //         friendList.forEach((addressBook: AddressBookGroup) => {
  //           if (addressBook.contacts.indexOf(userWebId) !== -1) {
  //             found = true;
  //           }
  //         });
  //       }
  //     }
  //     return found;
  //   }, false);
  
  //   const isInInbox = useAsync(async () => {
  //     let found = false;
  //     if (userWebId) {
  //       const friendRequests = await getIncomingRequests();
  //       return friendRequests.findIndex(request => request.getRef(schema.agent) === personWebId) !== -1;
  //     }
  //     return found;
  //   }, false);
  
  //   const isInYourList = useAsync(async () => {
  //     let found = false;
  //     if (userWebId) {
  //       const friendLists: TripleSubject[] | null = await getFriendLists();
  //       if (friendLists) {
  //         friendLists.forEach((friendList) => {
  //           const contacts = friendList.getAllNodeRefs(vcard.hasMember);
  //           if (contacts.indexOf(personWebId) !== -1) {
  //             found = true;
  //             // break;
  //           }
  //         });
  //       }
  //     }
  //     return found;
  //   }, false);
  //   if (!userWebId) {
  //     return null;
  //   }
  
  //   console.log({ personWebId, isInYourList, isInInbox, listsYou });
  //   let personType: PersonType = PersonType.stranger;
  //   if (personWebId === userWebId) {
  //     personType = PersonType.me;
  //   } else if (isInYourList) {
  //     if (listsYou) {
  //       personType = PersonType.friend
  //     } else {
  //       personType = PersonType.requested
  //     }
  //   } else if (isInInbox) {
  //     personType = PersonType.requested
  //   }
  //   return personType;
  // }
  
  return PersonType.stranger;
}

export async function getUriSub(webId: string): Promise<TripleSubject | null> {
  const profileDoc = await getDocument(webId);
  if (profileDoc === null) {
    return null;
  }
  return profileDoc.getSubject(webId);
}
export async function getPersonDetails(webId: string): Promise<PersonDetails | null> {
  const profileSub = await getUriSub(webId);
  if (profileSub === null) {
    return null;
  }
  return {
    webId,
    avatarUrl: profileSub.getRef(vcard.hasPhoto)|| '/img/default-avatar.png',
    fullName: profileSub.getRef(vcard.fn) || '(no name)',
    friends: await getFriends(webId),
    personType: await getPersonType(webId)
  };
}

export function usePersonDetails(webId: string | null): PersonDetails | null {
  const [personDetails, setPersonDetails] = React.useState<PersonDetails | null>(null);
  if (webId === null) {
    return null;
  }
  if (webId && !personDetails) {
    getPersonDetails(webId).then(setPersonDetails).catch((e: Error) => {
      console.error(e.message);
    });
  }
  return personDetails;
}