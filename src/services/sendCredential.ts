import { fetchUser } from 'tripledoc-solid-helpers';
import { ldp } from 'rdf-namespaces';

export async function sendCredential(credential: string, webId: string): Promise<null | string> {
  const user = await fetchUser(webId);
  if (!user) {
    return null;
  }

  const inbox = user.getNodeRef(ldp.inbox)
  if (!inbox) {
    return null;
  }

  const proposedFilename = 'ce_' + Date.now();
  const response = await fetch(inbox, {
    body: credential,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      slug: proposedFilename,
    },
  });

  return response.ok ? response.headers.get('Location') : null;
}