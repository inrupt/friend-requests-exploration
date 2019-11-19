import { TripleDocument, TripleSubject } from 'tripledoc';
import { getDocument } from '../DocumentCache';

const cachedProfileDocs: Map<string, TripleDocument> = new Map();

export async function getProfile(webId: string): Promise<TripleSubject | null> {
  const cachedProfileDoc = cachedProfileDocs.get(webId);
  if (cachedProfileDoc) {
    return cachedProfileDoc.getSubject(webId);
  }

  const profileDoc = await getDocument(webId);
  if (!profileDoc) {
    return null;
  }
  cachedProfileDocs.set(webId, profileDoc);

  return profileDoc.getSubject(webId);
}
