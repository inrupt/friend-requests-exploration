import SolidAuth from 'solid-auth-client';
import { ldp, vcard } from 'rdf-namespaces';
import { getUriSub, getFriendsGroupRef } from './usePersonDetails';
import { getDocument } from './DocumentCache';
import { getMyWebId } from './getMyWebId';

export async function determineUriRef(uri: string, ref: string, doc?: string): Promise<string | null> {
  const uriSub = await getUriSub(uri, doc);
  if (uriSub === null) {
    return null;
  }
  const ret = uriSub.getRef(ref);
  console.log('determined uri ref', uri, ref, ret);
  return ret;
}
export async function determineUriInbox(uri: string, doc?: string): Promise<string | null> {
  return determineUriRef(uri, ldp.inbox, doc);
}

export async function determineInboxesToUse(recipient: string): Promise<string[]> {
  const recipientFriendsGroupUrl: string | null = await getFriendsGroupRef(recipient, false);
  let ret: string[] = [];
  
  // prefer friend-requests inbox, if it exists:
  console.log("In determine Inboxes to Use " + recipientFriendsGroupUrl);
  if (recipientFriendsGroupUrl) {
    // Look for inbox of friends group at recipient profile
    // because we need to know the inbox to request access
    // to the group, see
    // https://github.com/inrupt/friend-requests-exploration/issues/72
    const friendsGroupInbox = await determineUriInbox(recipientFriendsGroupUrl, recipient);
    console.log("friends Group Inbox " + friendsGroupInbox );
    if (friendsGroupInbox) {
      ret.push(friendsGroupInbox);
    }
  }

  // always include recipient's main inbox:
  const mainInboxUrl = await determineUriInbox(recipient);
  if (mainInboxUrl) {
    ret.push(mainInboxUrl);
  }
  
  return ret;
}

export async function sendActionNotification(recipient: string, activityType: string) {
  const myWebId = await getMyWebId();
  if (!myWebId) {
    throw new Error('not logged in!');
  }
  const inboxUrls = await determineInboxesToUse(recipient);
  if (!inboxUrls.length) {
    throw new Error('This person does not accept friend requests.');
  }

  // TODO: Check if createDocument can do this with a URL we set manually:
  return SolidAuth.fetch(inboxUrls[0], {
    method: 'POST',
    body: `@prefix as: <https://www.w3.org/ns/activitystreams#> .
@prefix schema: <http://schema.org/> .
<> a as:${activityType} ;
  schema:agent <${myWebId}> .`,
    headers: {
      'Content-Type': 'text/turtle'
    }
  });
}

//what this is doing is passing in the recipients webId, 
//it then gets the current webId 
//to get where to add the data
//it then adds it but to the recipient webId..
//Have to check what else this function is used for..
export async function addToFriendsGroup(webId: string) {
  const myWebId = await getMyWebId();
  if (!myWebId) {
    throw new Error('not logged in!');
  }
  const friendsGroupRef = await getFriendsGroupRef(myWebId, true);
  console.log('got friendsGroupRef', friendsGroupRef);
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
    console.log("sendFriendRequest " + recipient);
  return sendActionNotification(recipient, 'Follow');
}

export async function initiateFriendship(recipient: string) {
  console.log("initiate Friendship " + recipient);
  await addToFriendsGroup(recipient);
  return sendActionNotification(recipient, 'Follow');
}

export async function sendConfirmation(recipient: string) {
  return sendActionNotification(recipient, 'Accept');
}