import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { withWebId, ProviderLogin } from '@inrupt/solid-react-components';

type Props = RouteComponentProps;

export const Consumer: React.FC<Props> = (props) => {
  const MyComponent = withWebId((webIdProps:any) => {
    if (webIdProps.webID) {
      return <> hello {webIdProps.webID} </>;
    } else {
      return <ProviderLogin />;
    }
  });
  return <MyComponent />;
};
