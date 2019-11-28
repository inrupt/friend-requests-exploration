import { Reference, TripleDocument } from 'tripledoc';
import { solid, vcard as vcardUpstream} from 'rdf-namespaces';
import { getDocument } from './DocumentCache';

const vcard = Object.assign({}, vcardUpstream, {
  Addressbook: 'http://www.w3.org/2006/vcard/ns#Addressbook'
});

export interface AddressBookGroup {
  name: string | null;
  contacts: Reference[];
};

export async function getAddressBookDocForWebId(webId: string | null): Promise<TripleDocument | null> {
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
  const addressbookIndex = publicTypeIndex.findSubject(solid.forClass, vcard.Addressbook);
  if (!addressbookIndex) {
    return null;
  }

  const addressbookDocRef = addressbookIndex.getNodeRef(solid.instance);
  if (!addressbookDocRef) {
    return null;
  }

  return getDocument(addressbookDocRef);
}

export async function getFriendListsForWebId(webId: string | null): Promise<AddressBookGroup[] | null> {
  const addressbookDoc: TripleDocument | null = await getAddressBookDocForWebId(webId);
  if (!addressbookDoc) {
    return null;
  }
  const groupSubjects = addressbookDoc.getSubjectsOfType(vcard.Group);

  return groupSubjects.map(list => {
    const addressBookGroup: AddressBookGroup = {
      name: list.getString(vcard.fn),
      contacts: list.getAllNodeRefs(vcard.hasMember),
    };
    return addressBookGroup;
  });
}