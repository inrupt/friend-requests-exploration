import SolidAuth from 'solid-auth-client';
import { ldp, schema, vcard } from 'rdf-namespaces';
import { getProfile } from './getProfile';
import { getInboxRefs } from './getInboxItems';
import { getFollowAction } from './getFollowAction';
import { TripleSubject } from 'tripledoc';
import { getFriendLists } from './getFriendList';
import { isBlockScoped } from '@babel/types';
import { getFriendListsForWebId, AddressBookGroup } from './getFriendListForWebId';
import { Address } from 'cluster';
import { BreadcrumbList } from 'rdf-namespaces/dist/schema';

export async function getIncomingRequests(): Promise<TripleSubject[]> {
  const currentSession = await SolidAuth.currentSession();
  if (!currentSession || !currentSession.webId) {
    throw new Error('Please log in to view your friend requests.');
  }
  const webId = currentSession.webId;
  const currentPersonGroups = await getFriendLists();
  let blocked: string[] = [];
  if (currentPersonGroups) {
    currentPersonGroups.forEach((group: TripleSubject) => {
      if (group.getLiteral(vcard.fn) === 'Blocked') {
        blocked = group.getAllRefs(vcard.hasMember);
      }
    });
  }
  async function checkBlockAndHost(friendRequest: TripleSubject | null): Promise<TripleSubject | null> {
    if (!friendRequest) {
      return null;
    }
    const webId = friendRequest.getRef(schema.agent);
    if (!webId) {
      return null;
    }
    if (blocked.indexOf(webId) !== -1) {
      return null;
    }
    console.log('looking for groups in addressbook of ', webId);
    const otherPersonGroups = await getFriendListsForWebId(webId);
    console.log(otherPersonGroups);
    let found = null;
    if (otherPersonGroups) {
      otherPersonGroups.forEach((group: AddressBookGroup) => {
        console.log('found group in addressbook of ', webId, group);
        // FIXME: don't use English-language string literal 'Blocked' as a group
        // name to mean blocked.
        if (group.name !== 'Blocked' && group.contacts.indexOf(webId) !== -1) {
          found = friendRequest;
        }
      });
    }
    return found;
  }


  const profile = await getProfile(webId);

  const inboxRef = profile.getRef(ldp.inbox);
  if (!inboxRef) {
    return [];
  }

  const inboxItemRefs = await getInboxRefs(inboxRef);
  const potentialFriendRequests = await Promise.all(inboxItemRefs.map(getFollowAction));
  const checkPromises: Promise<TripleSubject | null>[] = potentialFriendRequests.map(checkBlockAndHost);
  return (await Promise.all(checkPromises)).filter(isNotNull);;
}

function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}
