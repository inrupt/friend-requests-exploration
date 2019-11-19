import { TripleDocument, TripleSubject } from 'tripledoc';
import { useDocument } from './DocumentCache';

export function useProfile(webId: string | null): TripleSubject | null {
  const cachedProfileDoc: TripleDocument | null = useDocument(webId);
  if (webId === null) {
    return null;
  }
  if (cachedProfileDoc) {
    return cachedProfileDoc.getSubject(webId);
  }
  return null;
}
