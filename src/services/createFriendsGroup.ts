import { TripleDocument, TripleSubject, createDocument } from "tripledoc";
import SolidAuth from 'solid-auth-client';
import { getPodRoot } from "./usePersonDetails";
import { getDocument } from "./DocumentCache";
import { ensureContainer } from "./ensureContainer";
import { rdf, acl } from "rdf-namespaces";

const as = {
  following: 'https://www.w3.org/TR/activitypub/#following'
};

async function postDoc(body: string, containerUrl: string) {
  console.log('calling POST');
  // FIXME?: is there a way to do this with tripledoc?
  const response = await SolidAuth.fetch(containerUrl, {
    method: 'POST',
    headers: {
      Slug: 'friends',
      'Content-Type': 'text/turtle'
    },
    body
  });
  console.log('POST result', response);
  const relativeLocation = response.headers.get('Location')
  if (!relativeLocation) {
    throw new Error('no created location!');
  }
  // console.log('getting created location', location);
  return new URL(relativeLocation, containerUrl);
}

async function createAclDoc(webId: string, friendsGroupUri: string) {
  const friendsGroupDoc = await getDocument(friendsGroupUri);
  console.log('got friendsGroupDoc', webId, friendsGroupUri);
  const friendsAclRef = friendsGroupDoc.getAclRef();
  console.log('got acl ref', webId, friendsGroupUri, friendsAclRef);
  if (!friendsAclRef) {
    throw new Error('Could not determine ACL ref for friends list');
  }
  let friendsAclDoc
  try {
    await getDocument(friendsAclRef);
    console.log('got acl doc');
  } catch (e) {
    console.log('creating acl doc');
    friendsAclDoc = createDocument(friendsAclRef);
  }
  if (friendsAclDoc) {
    console.log('have friendsAclDoc');
    const ownerAcl = friendsAclDoc.addSubject();
    ownerAcl.addNodeRef(rdf.type, acl.Authorization);
    ownerAcl.addNodeRef(acl.accessTo, friendsGroupDoc.asNodeRef());
    ownerAcl.addNodeRef(acl.mode, acl.Read);
    ownerAcl.addNodeRef(acl.mode, acl.Append);
    ownerAcl.addNodeRef(acl.mode, acl.Write);
    ownerAcl.addNodeRef(acl.mode, acl.Control);
    ownerAcl.addNodeRef(acl.agent, webId);

    const friendsAcl = friendsAclDoc.addSubject();
    friendsAcl.addNodeRef(rdf.type, acl.Authorization);
    friendsAcl.addNodeRef(acl.accessTo, friendsGroupDoc.asNodeRef());
    friendsAcl.addNodeRef(acl.mode, acl.Read);
    friendsAcl.addNodeRef(acl.agentGroup, friendsGroupUri);
    friendsAclDoc.save();
  } else {
    console.log('have no friendsAclDoc');
  }
}

async function createInbox(podRoot: string) {
  // FIXME: is there a way to create a container with POST?
  const inboxUrl = new URL('/friend-requests-inbox/', podRoot).toString();
  await ensureContainer(inboxUrl);
  return inboxUrl;
}

async function linkFromProfile(webId: string, friendsGroupUri: string, inboxUrl: string) {
  console.log('linkFromProfile', webId, friendsGroupUri);
  const profileDoc: TripleDocument | null = await getDocument(webId);
  if (!profileDoc) {
    throw new Error('profile doc not fetched!');
  }

  const profileSub: TripleSubject | null = profileDoc.getSubject(webId);
  if (!profileSub) {
    throw new Error('profile sub not found!');
  }
  profileSub.addRef(as.following, friendsGroupUri);
  const remoteSub = profileDoc.getSubject(friendsGroupUri);
  remoteSub.addRef('http://www.w3.org/ns/ldp#inbox', inboxUrl);
  await profileDoc.save();
}

// avoid running this multiple times in parallel:
const promises: { [webId: string]: Promise<string>} = {};
export async function createFriendsGroup(webId: string) {
  if (!promises[webId]) {
    promises[webId] = doCreateFriendsGroup(webId);
  }
  return promises[webId];
}

async function doCreateFriendsGroup(webId: string) {
  let ret: string | null = null;
  console.log('creating!');
  const podRoot = await getPodRoot(webId);
  if (!podRoot) {
    throw new Error('no podRoot!');
  }
  const inboxUrl: string = await createInbox(podRoot);
  console.log('inbox created');
  const body = `<#this> a <http://www.w3.org/2006/vcard/ns#Group> .` +
    `<#this> <http://www.w3.org/2006/vcard/ns#fn> "Solid Friends" .` +
    `<#this> <http://www.w3.org/ns/ldp#inbox> <${inboxUrl}> .`;
  const absoluteLocation = await postDoc(body, podRoot);
  ret = new URL('#this', absoluteLocation).toString();
  console.log('doc created');
  await createAclDoc(webId, ret);
  console.log('acl created');
  await linkFromProfile(webId, ret, inboxUrl);
  console.log('linked from profile');
  return ret;
}