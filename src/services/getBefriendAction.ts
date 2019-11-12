import { Reference, TripleSubject } from 'tripledoc';
import { schema } from 'rdf-namespaces';
import { getDocument } from './DocumentCache';

export async function getBefriendAction(inboxRef: Reference): Promise<TripleSubject | null> {
  const inboxDocument = await getDocument(inboxRef);
  const befriendActions = inboxDocument.getSubjectsOfType(schema.BefriendAction);

  // If an inbox item is not exactly in the format we expect,
  // it's probably not what we're looking for:
  if (befriendActions.length !== 1) {
    return null;
  }

  return befriendActions[0];
}
