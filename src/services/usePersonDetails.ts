import React, { useEffect } from "react";
import { getDocument } from "./DocumentCache";
import { vcard, foaf } from "rdf-namespaces";
import { TripleSubject } from "tripledoc";
import { determineUriRef } from "./sendActionNotification";
import SolidAuth from 'solid-auth-client';
import { createFriendsGroup } from "./createFriendsGroup";

const as = {
  following: 'https://www.w3.org/TR/activitypub/#following'
};
const pim = {
  storage: 'http://www.w3.org/ns/pim/space#storage'
};

export enum PersonType {
  me = 'me',
  requester = 'requester',
  requested = 'requested',
  friend = 'friend',
  blocked = 'blocked',
  stranger = 'stranger'
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
  follows: string[] | null,
  personType: PersonType | null,
}

export async function getPodRoot(webId: string | null): Promise<string | null> {
  if (webId === null) {
    return null;
  }
  console.log('determining pod root', webId, pim.storage);
  return determineUriRef(webId, pim.storage);
}

export async function getFriendsGroupRef(webId: string | null, createIfMissing: boolean): Promise<string | null> {
  if (webId === null) {
    console.log('no webId!');
    return null;
  }
  console.log('getting friendsgroup ref', webId);
  let ret = await determineUriRef(webId, as.following);
  if (createIfMissing && !ret) {
    ret = await createFriendsGroup(webId);
  }
  console.log('returning!', ret);
  return ret;
}

async function getFollowsCollection(webId: string, createIfMissing = false): Promise<string[] | null> {
  try {
    const friendsGroupRef: string | null = await getFriendsGroupRef(webId, createIfMissing);
    if (!friendsGroupRef) {
      console.log('no friends list ref', webId);
      return null;
    }
    const friendsGroupSub = await getUriSub(friendsGroupRef);
    if (!friendsGroupSub) {
      console.log('no friends list sub', webId);
      return null;
    }
    const friends = friendsGroupSub.getAllRefs(vcard.hasMember);
    const profile = await getUriSub(webId);
    if (profile) {
      return friends.concat(profile.getAllRefs(foaf.knows));
    }
    return friends;
  } catch (e) {
    // console.log('something went wrong while fetching (403?)', friendsGroupRef);
    return null;
  }
}

async function lists (webId1: string, webId2: string): Promise<boolean | null> {
  const followsCollection = await getFollowsCollection(webId1);
  if (!followsCollection) {
    return null;
  }
  return (followsCollection.indexOf(webId2) !== -1);
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

export async function getUriSub(uri: string, docUrl?: string): Promise<TripleSubject | null> {
  if (!docUrl) {
    docUrl = uri;
  }
  const doc = await getDocument(docUrl);
  if (doc === null) {
    return null;
  }
  return Object.assign({
    save: doc.save.bind(doc)
  }, doc.getSubject(uri));
}

export async function getPersonDetails(webId: string, createFriendsGroupIfMissing = false): Promise<PersonDetails | null> {
  const profileSub = await getUriSub(webId);
  if (profileSub === null) {
    return null;
  }
  const ret = {
    webId,
    avatarUrl: profileSub.getRef(vcard.hasPhoto) || null,
    fullName: profileSub.getString(vcard.fn) || null,
    follows: await getFollowsCollection(webId, createFriendsGroupIfMissing),
    personType: await getPersonType(webId)
  };
  // console.log('person details', webId, profileSub, ret);
  return ret;
}

(window as any).getUriSub = getUriSub;
(window as any).getFriends = getFollowsCollection;
(window as any).getPersonDetails = getPersonDetails;


// Returns a PersonDetails object
// or null if still loading
// or undefined if loading failed
// This is for use in a 
export function usePersonDetails(webId: string | null, createFriendsGroupIfMissing = false): PersonDetails | null | undefined {
  const [personDetails, setPersonDetails] = React.useState<PersonDetails | null | undefined>(null);
  useEffect(() => {
    if (webId && (!personDetails || personDetails.webId !== webId)) {
      getPersonDetails(webId, createFriendsGroupIfMissing).catch((e: Error) => {
        console.error(e.message);
        return undefined;
      }).then(setPersonDetails);
    }
  }, [webId, personDetails, createFriendsGroupIfMissing]);
  if (webId === null) {
    return null;
  }
  return personDetails;
}