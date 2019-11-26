import SolidAuth from 'solid-auth-client';
import { ldp, vcard } from 'rdf-namespaces';
import { getUriSub, getFriendsGroupRef } from './usePersonDetails';
import { getDocument } from './DocumentCache';

export async function determineUriRef(uri: string, ref: string, doc?: string): Promise<string | null> {
  const uriSub = await getUriSub(uri, doc);
  if (uriSub === null) {
    return null;
  }
  const ret = uriSub.getRef(ref);
  // console.log('determined uri ref', uri, ref, ret);
  return ret;
}
export async function determineUriInbox(uri: string, doc?: string): Promise<string | null> {
  return determineUriRef(uri, ldp.inbox, doc);
}

export async function determineInboxToUse(recipient: string): Promise<string | null> {
  const recipientFriendsGroupUrl: string | null = await getFriendsGroupRef(recipient, false);
  if (recipientFriendsGroupUrl) {
    // Look for inbox of friends group at recipient profile
    // because we need to know the inbox to request access
    // to the group, see
    // https://github.com/inrupt/friend-requests-exploration/issues/72
    const friendsGroupInbox = determineUriInbox(recipientFriendsGroupUrl, recipient);
    if (friendsGroupInbox) {
      return friendsGroupInbox;
    }
  }
  // fallback to recipient's main inbox:
  return determineUriInbox(recipient);
}

export async function sendActionNotification(recipient: string, activityType: string) {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession) {
    throw new Error('not logged in!');
  }
  const inboxUrl = await determineInboxToUse(recipient);
  if (!inboxUrl) {
    throw new Error('This person does not accept friend requests.');
  }

  // TODO: Check if createDocument can do this with a URL we set manually:
  return SolidAuth.fetch(inboxUrl, {
    method: 'POST',
    body: `@prefix as: <https://www.w3.org/ns/activitystreams#> .
@prefix schema: <http://schema.org/> .
<> a as:${activityType} ;
  schema:agent <${currentSession.webId}> .`,
    headers: {
      'Content-Type': 'text/turtle'
    }
  });
}

export async function addToFriendsGroup(webId: string) {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession) {
    throw new Error('not logged in!');
  }
  const friendsGroupRef = await getFriendsGroupRef(currentSession.webId, true);
  if (!friendsGroupRef) {
    throw new Error('could not find my friends list');
  }
  const friendsGroupDoc = await getDocument(friendsGroupRef);
  if (!friendsGroupDoc) {
    throw new Error('could not access my friends list document');
  }
  const friendListSub = friendsGroupDoc.getSubject(friendsGroupRef);
  if (!friendListSub) {
    throw new Error('could not access my friends list group');
  }
  friendListSub.addRef(vcard.hasMember, webId);
  await friendsGroupDoc.save();
}

export async function sendFriendRequest(recipient: string) {
  return sendActionNotification(recipient, 'Follow');
}

export async function addFriend(recipient: string) {
  await addToFriendsGroup(recipient);
  return sendActionNotification(recipient, 'Follow');
}

export async function sendConfirmation(recipient: string) {
  return sendActionNotification(recipient, 'Accept');
}