import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { SignCredential } from '../publisher/components/SignCredential';
import { Credential } from '../publisher/components/ExportCredential';
import { sendCredential } from '../services/sendCredential';

type Props = RouteComponentProps;

export const Publisher: React.FC<Props> = (props) => {
  const [credential, setCredential] = React.useState();

  const processCredential = async (credential: string, subjectWebId: string) => {
    await sendCredential(credential, subjectWebId);
    setCredential(credential);
    return;
  };

  const component = (typeof credential === 'string')
    ? <Credential credential={credential}/>
    : <SignCredential onSign={processCredential}/>;

  return <>
    <section className="section">
      {component}
    </section>
  </>;
};
