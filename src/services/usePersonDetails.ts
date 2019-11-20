import React from "react";
import { getDocument } from "./DocumentCache";
import { vcard } from "rdf-namespaces";

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

async function getFriends(webId: string): Promise<string[]> {
  return [];
}

async function getPersonType(webId: string): Promise<PersonType> {
  return PersonType.stranger;
}

async function getPersonDetails(webId: string): Promise<PersonDetails | null> {
  const profileDoc = await getDocument(webId);
  if (profileDoc === null) {
    return null;
  }
  const profileSub = profileDoc.getSubject(webId);
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