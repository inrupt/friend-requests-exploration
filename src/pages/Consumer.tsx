import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { withWebId, ProviderLogin, LogoutButton } from '@inrupt/solid-react-components';
import { fetchDocument } from 'tripledoc';

type Props = RouteComponentProps;

async function getInboxItems(webId: string): Promise<Array<string>> {
  /* 1. Fetch the Document at `webId`: */
  const webIdDoc = await fetchDocument(webId);
  /* 2. Read the Subject representing the current user: */
  const profile = webIdDoc.getSubject(webId);
  /* 3. Get their ldp:inbox: */
  const inboxUri = profile.getNodeRef('http://www.w3.org/ns/ldp#inbox');
  if (!inboxUri) {
    return [];
  }
  const inboxDoc = await fetchDocument(inboxUri);
  const inboxThing = inboxDoc.getSubject('')
  const items = inboxThing.getAllNodeRefs('http://www.w3.org/ns/ldp#contains')
  return items
}

export const Consumer: React.FC<Props> = (props) => {
  const MyComponent = withWebId((webIdProps:any) => {
    console.log(webIdProps)
    if (webIdProps.webId) {
      getInboxItems(webIdProps.webId).then((inboxItems: Array<string>) => {
        console.log(inboxItems)
      }).catch((err: Error) => {
        console.error(err.message);
      })
      return <>
        hello {webIdProps.webId}, see the console for your inbox items!
        < LogoutButton />
      </>;
    } else {
      return <ProviderLogin
        callbackUri={window.location.href}
      />;
    }
  });
  return <MyComponent />;
};
