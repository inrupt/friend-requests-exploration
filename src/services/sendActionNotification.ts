import SolidAuth from 'solid-auth-client';
import { ldp } from 'rdf-namespaces';
import { getUriSub, getFriendslistRef } from './usePersonDetails';

export async function determineUriRef(uri: string, ref: string): Promise<string | null> {
  const uriSub = await getUriSub(uri);
  if (uriSub === null) {
    return null;
  }
  const ret = uriSub.getRef(ref);
  console.log('determined uri ref', uri, ref, ret);
  return ret;
}
export async function determineUriInbox(uri: string): Promise<string | null> {
  return determineUriRef(uri, ldp.inbox);
}

export async function determineInboxToUse(recipient: string): Promise<string | null> {
  const recipientAddressBookUrl: string | null = await getFriendslistRef(recipient, false);
  if (recipientAddressBookUrl) {
    const addressBookInbox = determineUriInbox(recipientAddressBookUrl);
    if (addressBookInbox) {
      return addressBookInbox;
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

export async function sendFriendRequest(recipient: string) {
  return sendActionNotification(recipient, 'Follow');
}

export async function sendConfirmation(recipient: string) {
  return sendActionNotification(recipient, 'Accept');
}