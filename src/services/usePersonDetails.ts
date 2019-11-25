import React from "react";
import { getDocument } from "./DocumentCache";
import { vcard } from "rdf-namespaces";
import { TripleSubject } from "tripledoc";
import { determineUriRef } from "./sendActionNotification";
import SolidAuth from 'solid-auth-client';

const as = {
  following: 'https://www.w3.org/TR/activitypub/#following'
};
const pim = {
  storage: 'http://www.w3.org/ns/pim/space#'
};

export enum PersonType {
  me,
  requester,
  requested,
  friend,
  blocked,
  stranger
}

// This is basically a model in the MVC sense.
// null means gave up on trying to determine it.
// There may be cases where the view doesn't need to know all aspects of
// the model, but for simplicity, `usePersonDetails` will always try to
// be as complete as possible.
export type PersonDetails = {
  webId: string,
  avatarUrl: string | null,
  fullName: string | null,
  friends: string[] | null,
  personType: PersonType | null
}

export async function getPodRoot(webId: string | null): Promise<string | null> {
  if (webId === null) {
    return null;
  }
  return determineUriRef(webId, pim.storage);
}

export async function getFriendslistRef(webId: string | null, createIfMissing: boolean): Promise<string | null> {
  if (webId === null) {
    return null;
  }
  let ret = await determineUriRef(webId, as.following);
  if (createIfMissing && !ret) {
    const podRoot = await getPodRoot(webId);
    if (!podRoot) {
      return null;
    }
    // FIXME?: is there a way to do this with tripledoc?
    const response = await SolidAuth.fetch(podRoot, {
      method: 'POST',
      headers: {
        Slug: 'friends',
        'Content-Type': 'text/turtle'
      },
      body: '<#this> a <http://www.w3.org/2006/vcard/ns#Group> .'
        + '<#this> <http://www.w3.org/2006/vcard/ns#fn> "Solid Friends" .'
    });
    const location = response.headers.get('Location');
    if (!location) {
      return null
    }
    console.log('getting created location', location);
    ret = new URL('#this', location).toString();
    const profile: TripleSubject | null = await getUriSub(webId);
    if (profile) {
      profile.addRef(as.following, ret);
    }
  }
  return ret;
}

async function getFriends(webId: string): Promise<string[] | null> {
  const friendsListRef: string | null = await getFriendslistRef(webId, false);
  if (!friendsListRef) {
    return null;
  }
  const friendsListSub = await getUriSub(friendsListRef);
  if (!friendsListSub) {
    return null;
  }
  return friendsListSub.getAllRefs(vcard.hasMember);
}

async function lists (webId1: string, webId2: string): Promise<boolean | null> {
  const friends = await getFriends(webId1);
  if (!friends) {
    return null;
  }
  return (friends.indexOf(webId2) !== -1);
}

async function getPersonType(theirWebId: string): Promise<PersonType | null> {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession) {
    return null;
  }
  const myWebId = currentSession.webId;
  if (!myWebId) {
    return null;
  }
  if (theirWebId === myWebId) {
    return PersonType.me;
  }
  if (await lists(theirWebId, myWebId)) {
    if (await lists(myWebId, theirWebId)) {
      return PersonType.friend;
    } else {
      return PersonType.requester;
    }
  } else {
    if (await lists(myWebId, theirWebId)) {
      return PersonType.requested;
    } else {
      return PersonType.stranger;
    }
  }
}

export async function getUriSub(uri: string): Promise<TripleSubject | null> {
  const doc = await getDocument(uri);
  if (doc === null) {
    return null;
  }
  return doc.getSubject(uri);
}

export async function getPersonDetails(webId: string): Promise<PersonDetails | null> {
  const profileSub = await getUriSub(webId);
  if (profileSub === null) {
    return null;
  }
  const ret = {
    webId,
    avatarUrl: profileSub.getRef(vcard.hasPhoto) || null,
    fullName: profileSub.getString(vcard.fn) || null,
    friends: await getFriends(webId),
    personType: await getPersonType(webId)
  };
  console.log('person details', webId, profileSub, ret);
  return ret;
}

(window as any).getUriSub = getUriSub;
(window as any).getFriends = getFriends;
(window as any).getPersonDetails = getPersonDetails;

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