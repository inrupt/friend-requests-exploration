import { TripleDocument, TripleSubject } from 'tripledoc';
import { useDocument } from './DocumentCache';

export function useProfile(webId: string): TripleSubject | null {
  const cachedProfileDoc: TripleDocument | null = useDocument(webId);
  if (cachedProfileDoc) {
    return cachedProfileDoc.getSubject(webId);
  }
  return null;
}
