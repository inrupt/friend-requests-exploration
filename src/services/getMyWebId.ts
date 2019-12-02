import SolidAuth from 'solid-auth-client';

export async function getMyWebId(): Promise<string | null> {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession) {
    return null;
  }
  return currentSession.webId;
}
