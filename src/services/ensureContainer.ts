import SolidAuth from 'solid-auth-client';
import { getDocument } from './DocumentCache';
import { createDocument } from 'tripledoc';
import { rdf, acl, foaf } from 'rdf-namespaces';

export async function ensureContainer(url: string) {
  if (url.substr(-1) !== '/') {
    url += '/';
  }
  // console.log('creating container', url);
  // FIXME: is there a way to create a container with POST?
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

export async function createAclDoc(webId: string, resourceUri: string, otherAuthMode: string, otherAuthGroup: string) {
  const resourceDoc = await getDocument(resourceUri);
  console.log('got friendsGroupDoc', webId, resourceUri);
  const aclRef = resourceDoc.getAclRef();
  console.log('got acl ref', webId, resourceUri, aclRef);
  if (!aclRef) {
    throw new Error('Could not determine ACL ref for friends list');
  }
  let aclDoc
  try {
    await getDocument(aclRef);
    console.log('got acl doc');
  } catch (e) {
    console.log('creating acl doc');
    aclDoc = createDocument(aclRef);
  }
  if (aclDoc) {
    console.log('have aclDoc');
    const ownerAuthSub = aclDoc.addSubject();
    ownerAuthSub.addNodeRef(rdf.type, acl.Authorization);
    ownerAuthSub.addNodeRef(acl.accessTo, resourceDoc.asNodeRef());
    ownerAuthSub.addNodeRef(acl.mode, acl.Read);
    ownerAuthSub.addNodeRef(acl.mode, acl.Write);
    ownerAuthSub.addNodeRef(acl.mode, acl.Control);
    ownerAuthSub.addNodeRef(acl.agent, webId);

    const otherAuthSub = aclDoc.addSubject();
    otherAuthSub.addNodeRef(rdf.type, acl.Authorization);
    otherAuthSub.addNodeRef(acl.accessTo, resourceDoc.asNodeRef());
    otherAuthSub.addNodeRef(acl.mode, otherAuthMode);
    otherAuthSub.addNodeRef(acl.agentGroup, otherAuthGroup);
    aclDoc.save();
  } else {
    console.log('have no aclDoc');
  }
}

export async function createFriendsGroupAclDoc(webId: string, friendsGroupUri: string) {
  return createAclDoc(webId, friendsGroupUri, acl.Read, friendsGroupUri);
}

export async function createInbox(podRoot: string, webId: string) {
  const inboxUrl = new URL('/friend-requests-inbox/', podRoot).toString();
  await ensureContainer(inboxUrl);
  await createAclDoc(webId, inboxUrl, acl.Append, foaf.Agent);
  return inboxUrl;
}