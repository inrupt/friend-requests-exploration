import { vcard as vcardUpstream, rdf, acl, ldp } from 'rdf-namespaces';
import SolidAuth from 'solid-auth-client';
import { fetchDocumentForClass } from 'tripledoc-solid-helpers';
import { TripleSubject, createDocument, TripleDocument } from 'tripledoc';
import { useDocument, getDocument } from './DocumentCache';
import { useProfile } from './useProfile';
import { ensureContainer } from './ensureContainer';
import { getProfile } from './getProfile';

const vcard = Object.assign({}, vcardUpstream, {
  Addressbook: 'http://www.w3.org/2006/vcard/ns#Addressbook'
});

let addressBookDocumentPromise: Promise<TripleDocument | null>;

export async function unFriend(webId: string) {
  const addressBookDocument: TripleDocument | null = await getAddressBookDocument();
  if (!addressBookDocument) {
    return null;
  }
  const groups = addressBookDocument.getSubjectsOfType(vcard.Group);
  groups.forEach((group: TripleSubject) => {
    group.removeRef(vcard.hasMember, webId);
  });
  return addressBookDocument.save();
}

export async function getAddressBookDocument(): Promise<TripleDocument | null> {
  
  // Find a Document that is a vcard:Addressbook
  if (!addressBookDocumentPromise) {
    addressBookDocumentPromise = fetchDocumentForClass(vcard.Addressbook);
  }
  const addressBookDocument = await addressBookDocumentPromise;
  return addressBookDocument;
}

export async function getFriendLists(): Promise<TripleSubject[] | null> {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession || !currentSession.webId) {
    return null;
  }
  const addressBookDocument: TripleDocument | null = await getAddressBookDocument();
  if (!addressBookDocument) {
    return null;
  }
  const groups = addressBookDocument.getSubjectsOfType(vcard.Group);
  if (groups.length === 0) {
    // If no vcard:Group exists yet in the address book, create one named "Friends":
    const firstGroup = addressBookDocument.addSubject();
    firstGroup.addNodeRef(rdf.type, vcard.Group);
    firstGroup.addLiteral(vcard.fn, 'Friends');
    const addressBookSubject = addressBookDocument.getSubject('#this');
    const profile = await getProfile(currentSession.webId);
    if (!profile) {
      return [];
    }
    let inboxRef = profile.getRef(ldp.inbox);
    if (!inboxRef) {
      inboxRef = new URL('./inbox/', currentSession.webId).toString();
    }
    const friendRequestsInbox = new URL('./friend-requests/', inboxRef).toString();
    await ensureContainer(friendRequestsInbox);
    addressBookSubject.addRef(ldp.inbox, friendRequestsInbox);

    await addressBookDocument.save();

    // Then give everybody in that group permission to read the Document, and the Owner to modify it:
    const friendsAclRef = addressBookDocument.getAclRef();
    if (friendsAclRef) {
      const friendsAclDoc = await getDocument(friendsAclRef);
      // FIXME: deal with create-if-missing
      // } catch (e) {
      //   friendsAclDoc = createDocument(friendsAclRef);
      // }
      if (friendsAclDoc) {
        const ownerAcl = friendsAclDoc.addSubject();
        ownerAcl.addNodeRef(rdf.type, acl.Authorization);
        ownerAcl.addNodeRef(acl.accessTo, addressBookDocument.asNodeRef());
        ownerAcl.addNodeRef(acl.mode, acl.Read);
        ownerAcl.addNodeRef(acl.mode, acl.Append);
        ownerAcl.addNodeRef(acl.mode, acl.Write);
        ownerAcl.addNodeRef(acl.mode, acl.Control);
        ownerAcl.addNodeRef(acl.agent, currentSession.webId);

        const friendsAcl = friendsAclDoc.addSubject();
        friendsAcl.addNodeRef(rdf.type, acl.Authorization);
        friendsAcl.addNodeRef(acl.accessTo, addressBookDocument.asNodeRef());
        friendsAcl.addNodeRef(acl.mode, acl.Read);
        friendsAcl.addNodeRef(acl.agentGroup, firstGroup.asNodeRef());
        friendsAclDoc.save();
      }
    }

    groups.push(firstGroup);
  }

  return groups;
}
