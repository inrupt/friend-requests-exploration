import { Reference, TripleSubject } from 'tripledoc';
import { useDocument } from './DocumentCache';

const as = {
  Accept: 'https://www.w3.org/ns/activitystreams#Accept',
  Follow: 'https://www.w3.org/ns/activitystreams#Follow',
  Block: 'https://www.w3.org/ns/activitystreams#Block',
};

export async function getFollowAction(inboxRef: Reference): Promise<TripleSubject | null> {
  try {
    const inboxDocument = useDocument(inboxRef);
    if (!inboxDocument) {
      return null;
    }
    const befriendActions = inboxDocument.getSubjectsOfType(as.Follow);

    // If an inbox item is not exactly in the format we expect,
    // it's probably not what we're looking for:
    if (befriendActions.length !== 1) {
      return null;
    }

    return befriendActions[0];
  } catch (e) {
    console.error('unreadable inbox document', inboxRef);
    return null;
  }
}
