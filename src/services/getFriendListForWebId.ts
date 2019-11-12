import { Reference } from 'tripledoc';
import { solid, vcard } from 'rdf-namespaces';
import { getDocument } from './DocumentCache';

export interface AddressBook {
  name: string | null;
  contacts: Reference[];
};

export async function getFriendListsForWebId(webId: string | null): Promise<AddressBook[] | null> {
  if (!webId) {
    return null;
  }
  const profileDoc = await getDocument(webId);
  const profile = profileDoc.getSubject(webId);
  const publicTypeIndexRef = profile.getNodeRef(solid.publicTypeIndex);
  if (!publicTypeIndexRef) {
    return null;
  }

  const publicTypeIndex = await getDocument(publicTypeIndexRef);
  const individualIndex = publicTypeIndex.findSubject(solid.forClass, vcard.Individual);
  if (!individualIndex) {
    return null;
  }

  const friendListsDocRef = individualIndex.getNodeRef(solid.instance);
  if (!friendListsDocRef) {
    return null;
  }

  const friendListsDoc = await getDocument(friendListsDocRef);
  const friendLists = friendListsDoc.getSubjectsOfType(vcard.Group);

  const addressBooks = friendLists.map(list => {
    const addressBook: AddressBook = {
      name: list.getString(vcard.fn),
      contacts: list.getAllNodeRefs(vcard.hasMember),
    };
    return addressBook;
  });
  return addressBooks;
}
