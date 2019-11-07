import SolidAuth from 'solid-auth-client';
import { ldp } from 'rdf-namespaces';
import { getProfile } from './getProfile';
import { getInboxRefs } from './getInboxItems';
import { getBefriendAction } from './getBefriendAction';
import { TripleSubject } from 'tripledoc';

export async function getIncomingRequests(): Promise<TripleSubject[]> {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession || !currentSession.webId) {
    throw new Error('Please log in to view your friend requests.');
  }
  const webId = currentSession.webId;

  const profile = await getProfile(webId);

  const inboxRef = profile.getRef(ldp.inbox);
  if (!inboxRef) {
    return [];
  }

  const inboxItemRefs = await getInboxRefs(inboxRef);
  const potentialFriendRequests = await Promise.all(inboxItemRefs.map(getBefriendAction));
  const friendRequests = potentialFriendRequests.filter(isNotNull);

  return friendRequests;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
