import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { SignCredential } from '../publisher/components/SignCredential';
import { Credential } from '../publisher/components/ExportCredential';
import { sendCredential } from '../services/sendCredential';

type Props = RouteComponentProps;

export const Publisher: React.FC<Props> = (props) => {
  const [credential, setCredential] = React.useState<{ cred: string; webId: string; }>();
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (!credential) {
      return;
    }
    sendCredential(credential.cred, credential.webId).then(() => setSent(true));
  }, [credential]);

  const component = (sent && typeof credential !== 'undefined')
    ? <Credential credential={credential.cred}/>
    : <SignCredential onSign={(cred, webId) => setCredential({ cred, webId })}/>;

  return <>
    <section className="section">
      {component}
    </section>
  </>;
};
