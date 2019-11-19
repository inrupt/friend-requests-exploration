import { Reference } from 'tripledoc';
import { ldp } from 'rdf-namespaces';
import { getDocument } from './DocumentCache';

export async function getInboxRefs(inboxRef: Reference): Promise<Reference[]> {
  const containerDoc = await getDocument(inboxRef);
  if (!containerDoc) {
    return [];
  }
  const container = containerDoc.getSubject(inboxRef);
  return container.getAllRefs(ldp.contains);
}
