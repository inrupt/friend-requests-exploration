import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { withWebId, ProviderLogin } from '@inrupt/solid-react-components';

type Props = RouteComponentProps;

export const Consumer: React.FC<Props> = (props) => {
  const MyComponent = withWebId((webIdProps:any) => {
    console.log(webIdProps)
    if (webIdProps.webId) {
      return <> hello {webIdProps.webId} </>;
    } else {
      return <ProviderLogin
        callbackUri={window.location.href}
      />;
    }
  });
  return <MyComponent />;
};
