import { getMyWebId } from './getMyWebId';
import { getFriendsGroupRef, getUriSub } from './usePersonDetails';
import { getDocument } from './DocumentCache';
import { vcard } from 'rdf-namespaces';

export async function unFriend (webId: string) {
  const myWebId = await getMyWebId();
  if (!myWebId) {
    throw new Error('not logged in!');
  }
  const friendsGroupRef = await getFriendsGroupRef(myWebId, false);
  if (!friendsGroupRef) {
    throw new Error('no friends group ref!');
  }
  const friendsGroupDoc = await getDocument(friendsGroupRef);
  if (!friendsGroupDoc) {
    throw new Error('no friends group doc');
  }
  const friendsGroupSub = friendsGroupDoc.getSubject(friendsGroupRef);
  console.log('removing!', myWebId, friendsGroupRef, webId);
  friendsGroupSub.removeRef(vcard.hasMember, webId);
  return friendsGroupDoc.save();
}