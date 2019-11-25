import SolidAuth from 'solid-auth-client';

export async function ensureContainer(url: string) {
  if (url.substr(-1) !== '/') {
    url += '/';
  }
  // console.log('creating container', url);
  const scoutUrl: string = new URL('delete-me', url).toString();
  await SolidAuth.fetch(scoutUrl, {
    method: 'PUT',
    body: 'delete me'
  });
  await SolidAuth.fetch(scoutUrl, {
    method: 'DELETE',
    body: 'delete me'
  });
}