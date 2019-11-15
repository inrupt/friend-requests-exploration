import { Reference, TripleSubject } from 'tripledoc';
import { getDocument } from './DocumentCache';

const as = {
  Accept: 'https://www.w3.org/ns/activitystreams#Accept',
  Follow: 'https://www.w3.org/ns/activitystreams#Follow',
  Block: 'https://www.w3.org/ns/activitystreams#Block',
};

export async function getFollowAction(inboxRef: Reference): Promise<TripleSubject | null> {
  const inboxDocument = await getDocument(inboxRef);
  const befriendActions = inboxDocument.getSubjectsOfType(as.Follow);

  // If an inbox item is not exactly in the format we expect,
  // it's probably not what we're looking for:
  if (befriendActions.length !== 1) {
    return null;
  }

  return befriendActions[0];
}
