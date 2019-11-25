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

async function createAclDoc(webId: string, friendsListUri: string) {
  const friendsListDoc = await getDocument(friendsListUri);
  const friendsAclRef = friendsListDoc.getAclRef();
  if (!friendsAclRef) {
    throw new Error('Could not determine ACL ref for friends list');
  }
  let friendsAclDoc
  try {
    await getDocument(friendsAclRef);
  } catch (e) {
    friendsAclDoc = createDocument(friendsAclRef);
  }
  if (friendsAclDoc) {
    const ownerAcl = friendsAclDoc.addSubject();
    ownerAcl.addNodeRef(rdf.type, acl.Authorization);
    ownerAcl.addNodeRef(acl.accessTo, friendsListDoc.asNodeRef());
    ownerAcl.addNodeRef(acl.mode, acl.Read);
    ownerAcl.addNodeRef(acl.mode, acl.Append);
    ownerAcl.addNodeRef(acl.mode, acl.Write);
    ownerAcl.addNodeRef(acl.mode, acl.Control);
    ownerAcl.addNodeRef(acl.agent, webId);

    const friendsAcl = friendsAclDoc.addSubject();
    friendsAcl.addNodeRef(rdf.type, acl.Authorization);
    friendsAcl.addNodeRef(acl.accessTo, friendsListDoc.asNodeRef());
    friendsAcl.addNodeRef(acl.mode, acl.Read);
    friendsAcl.addNodeRef(acl.agentGroup, friendsListUri);
    friendsAclDoc.save();
  }
}

async function createInbox(podRoot: string) {
  // FIXME: is there a way to create a container with POST?
  const inboxUrl = new URL('/friend-requests-inbox/', podRoot).toString();
  await ensureContainer(inboxUrl);
  return inboxUrl;
}

async function linkFromProfile(webId: string, ret: string) {
  const profileDoc: TripleDocument | null = await getDocument(webId);
  if (!profileDoc) {
    throw new Error('profile doc not fetched!');
  }

  const profileSub: TripleSubject | null = profileDoc.getSubject(webId);
  if (!profileSub) {
    throw new Error('profile sub not found!');
  }
  profileSub.addRef(as.following, ret);
  console.log('friends list created, linking', webId, ret);
  await profileDoc.save();
  
}

export async function createFriendsList(webId: string) {
  let ret: string | null = null;
  console.log('creating!');
  const podRoot = await getPodRoot(webId);
  if (!podRoot) {
    throw new Error('no podRoot!');
  }
  const inboxUrl = createInbox(podRoot);
  const body = `<#this> a <http://www.w3.org/2006/vcard/ns#Group> .` +
    `<#this> <http://www.w3.org/2006/vcard/ns#fn> "Solid Friends" .` +
    `<#this> <http://www.w3.org/ns/ldp#inbox> <${inboxUrl}> .`;
  const absoluteLocation = await postDoc(body, podRoot);
  ret = new URL('#this', absoluteLocation).toString();
  await createAclDoc(webId, ret);
  await linkFromProfile(webId, ret);
  return ret;
}