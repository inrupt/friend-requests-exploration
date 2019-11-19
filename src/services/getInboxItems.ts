import { Reference } from 'tripledoc';
import { ldp } from 'rdf-namespaces';
import { useDocument } from './DocumentCache';

export async function getInboxRefs(inboxRef: Reference): Promise<Reference[]> {
  const containerDoc = useDocument(inboxRef);
  if (!containerDoc) {
    return [];
  }
  const container = containerDoc.getSubject(inboxRef);
  return container.getAllRefs(ldp.contains);
}
