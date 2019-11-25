import React from "react";
import { getDocument } from "./DocumentCache";
import { vcard } from "rdf-namespaces";
import { TripleSubject, TripleDocument } from "tripledoc";
import { determineUriRef } from "./sendActionNotification";
import SolidAuth from 'solid-auth-client';
import { countriesNotSupported } from "rdf-namespaces/dist/schema";

const as = {
  following: 'https://www.w3.org/TR/activitypub/#following'
};
const pim = {
  storage: 'http://www.w3.org/ns/pim/space#storage'
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
  console.log('determining pod root', webId, pim.storage);
  return determineUriRef(webId, pim.storage);
}

export async function getFriendsListRef(webId: string | null, createIfMissing: boolean): Promise<string | null> {
  if (webId === null) {
    console.log('no webId!');
    return null;
  }
  console.log('getting friendslist ref', webId);
  let ret = await determineUriRef(webId, as.following);
  if (createIfMissing && !ret) {
    console.log('creating!');
    const podRoot = await getPodRoot(webId);
    if (!podRoot) {
      console.log('no podRoot!');
      return null;
    }
    console.log('calling POST');
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
    console.log('POST result', response);
    const relativeLocation = response.headers.get('Location')
    if (!relativeLocation) {
      console.log('no created location!');
      return null
    }
    // console.log('getting created location', location);
    const absoluteLocation = new URL(relativeLocation, podRoot);  
    ret = new URL('#this', absoluteLocation).toString();
    const profileDoc: TripleDocument | null = await getDocument(webId);
    if (!profileDoc) {
      console.log('profile doc not fetched!');
      return null
    }
    const profileSub: TripleSubject | null = profileDoc.getSubject(webId);
    if (!profileSub) {
      console.log('profile sub not found!');
      return null
    }
    profileSub.addRef(as.following, ret);
    console.log('friends list created, linking', webId, ret);
    await profileDoc.save();
  }
  console.log('returning!', ret);
  return ret;
}

async function getFriends(webId: string): Promise<string[] | null> {
  try {
    const friendsListRef: string | null = await getFriendsListRef(webId, false);
    if (!friendsListRef) {
      console.log('no friends list ref', webId);
      return null;
    }
    const friendsListSub = await getUriSub(friendsListRef);
    if (!friendsListSub) {
      console.log('no friends list sub', webId);
      return null;
    }
    return friendsListSub.getAllRefs(vcard.hasMember);
  } catch (e) {
    console.log('something went wrong', webId, e);
    return null;
  }
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
  return Object.assign({
    save: doc.save.bind(doc)
  }, doc.getSubject(uri));
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
  // console.log('person details', webId, profileSub, ret);
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