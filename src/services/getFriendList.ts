import { vcard, rdf, acl } from 'rdf-namespaces';
import SolidAuth from 'solid-auth-client';
import { fetchDocumentForClass } from 'tripledoc-solid-helpers';
import { TripleSubject, createDocument, TripleDocument } from 'tripledoc';
import { getDocument } from './DocumentCache';

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
  
  // Find a Document that lists vcard:Individual's
  if (!addressBookDocumentPromise) {
    addressBookDocumentPromise = fetchDocumentForClass(vcard.Individual);
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
    firstGroup.addLiteral(vcard.fn, 'Friends')
    await addressBookDocument.save();

    // Then give everybody in that group permission to read the Document, and the Owner to modify it:
    const friendsAclRef = addressBookDocument.getAclRef();
    if (friendsAclRef) {
      let friendsAclDoc
      try {
        await getDocument(friendsAclRef);
      } catch (e) {
        friendsAclDoc = createDocument(friendsAclRef);
      }
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
