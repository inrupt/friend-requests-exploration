import { Reference, TripleSubject, fetchDocument } from 'tripledoc';
import { schema } from 'rdf-namespaces';

export async function getBefriendAction(inboxRef: Reference): Promise<TripleSubject | null> {
  const inboxDocument = await fetchDocument(inboxRef);
  const befriendActions = inboxDocument.getSubjectsOfType(schema.BefriendAction);

  // If an inbox item is not exactly in the format we expect,
  // it's probably not what we're looking for:
  if (befriendActions.length !== 1) {
    return null;
  }

  return befriendActions[0];
}
