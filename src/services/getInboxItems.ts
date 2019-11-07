import { fetchDocument, Reference } from 'tripledoc';
import { ldp } from 'rdf-namespaces';

export async function getInboxRefs(inboxRef: Reference): Promise<Reference[]> {
  const containerDoc = await fetchDocument(inboxRef);
  const container = containerDoc.getSubject(inboxRef);
  return container.getAllRefs(ldp.contains);
}
