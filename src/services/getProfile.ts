import { TripleDocument, fetchDocument, TripleSubject } from 'tripledoc';

const cachedProfileDocs: Map<string, TripleDocument> = new Map();

export async function getProfile(webId: string): Promise<TripleSubject> {
  const cachedProfileDoc = cachedProfileDocs.get(webId);
  if (cachedProfileDoc) {
    return cachedProfileDoc.getSubject(webId);
  }

  const profileDoc = await fetchDocument(webId);
  cachedProfileDocs.set(webId, profileDoc);

  return profileDoc.getSubject(webId);
}
