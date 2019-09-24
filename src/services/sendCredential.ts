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

  const response = await fetch(inbox, {
    body: credential,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.ok ? response.headers.get('Location') : null;
}