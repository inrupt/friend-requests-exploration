import React from 'react';
import { RouteComponentProps, Link } from '@reach/router';

type Props = RouteComponentProps;

export const Home: React.FC<Props> = (props) => {
  return <>
    <section className="section">
        <div className="title">
            OIX Trusted Environment Visualisation
        </div>
        <div className="panel">
            This is a simple example of how a <b>Corroborating Event</b> (CE) could be represented by a <b>W3C
            Verifiable Credential</b>, issued by a <b>Publisher</b> at the point of carrying out the event and
            written directly to an <b>Individual's</b> personal data store (<b>Solid Pod</b>).
        </div>
        <div className="panel">
            Subsequently the Individual can provide the CE to a <b>Consumer</b> who can verify that it
            represents an <b>Identify Verifying Event</b>. A check of a drivers license in a Bank branch.
            They do so by providing the <b>URL</b> of the CE resource inside their Pod.
        </div>
        <div className="panel">
            The two choices below demonstrate the roles of Publisher and Consumer. A Solid <b>WebID</b> of an
            Individual's Pod is required in both cases to publish a CE to and subsequently consume from.
        </div>
      <div className="buttons">
        <Link
          to="publisher"
          className="button is-primary"
        >Publisher</Link>
        <Link
          to="consumer"
          className="button"
        >Consumer</Link>
      </div>
    </section>
  </>;
};
