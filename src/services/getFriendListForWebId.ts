import { fetchDocument, NodeRef } from 'tripledoc';
import { solid, vcard } from 'rdf-namespaces';

interface AddressBook {
  name: string | null;
  contacts: NodeRef[];
};

export async function getFriendListsForWebId(webId: string): Promise<AddressBook[] | null> {
  const profileDoc = await fetchDocument(webId);
  const profile = profileDoc.getSubject(webId);
  const publicTypeIndexRef = profile.getNodeRef(solid.publicTypeIndex);
  if (!publicTypeIndexRef) {
    return null;
  }

  const publicTypeIndex = await fetchDocument(publicTypeIndexRef);
  const individualIndex = publicTypeIndex.findSubject(solid.forClass, vcard.Individual);
  if (!individualIndex) {
    return null;
  }

  const friendListsDocRef = individualIndex.getNodeRef(solid.instance);
  if (!friendListsDocRef) {
    return null;
  }

  const friendListsDoc = await fetchDocument(friendListsDocRef);
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
