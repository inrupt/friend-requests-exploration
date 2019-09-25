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

        <div className="title">
            Publishing a Corroborating Event
        </div>

        <div className="panel">
         A Publisher is any organisation that may check evidence of an Attribute of an Individual for the purposes of assuring themselves
          of their Identity or rights to some form of Entitlement. This will usually be done as part of their own business
            process for a service or product being offered to the Individual. However, the part of their process that checks evidence of Identity, or an Attribute return
            of Identity, is being made available to the Individual so they can share that with any other organisation, a <b>Corroborating Event Consumer</b>, so the check does not have to be repeated.
            Both the Publisher and the Consumer are party to a <b>Trust Framework</b>.
        </div>

        <div className="panel">
            The OIX Trusted Environment use case was based on sharing an evidence check for a Residential Address. An acceptable form of evidence, perhaps based
            on <a target="_blank" href="https://www.gov.uk/government/publications/identity-proofing-and-verification-of-an-individual">UK GOV GPG 45</a>,would have been submitted and then a CE provided in return.
        </div>

        <div className="panel">
            {component}
        </div>

    </section>
  </>;
};
