import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { SignCredential } from '../publisher/components/SignCredential';
import { ExportCredential } from '../publisher/components/ExportCredential';

type Props = RouteComponentProps;

export const Publisher: React.FC<Props> = (props) => {
  const [credential, setCredential] = React.useState();

  const component = (typeof credential === 'string')
    ? <ExportCredential credential={credential}/>
    : <SignCredential onSign={setCredential}/>;

  return <>
    <section className="section">
      {component}
    </section>
  </>;
};
