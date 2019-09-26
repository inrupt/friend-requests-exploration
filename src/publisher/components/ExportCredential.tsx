import React from 'react';

interface Props {
  credential: string;
  webId: string;
};

export const Credential: React.FC<Props> = (props) => {
  return <>
    <div className="field">
      <label htmlFor="subject" className="label">Corroborating Event (W3C VC)</label>
      <div className="control">
        <textarea
          name="credential"
          id="credential"
          readOnly={true}
          cols={30}
          rows={10}
          value={props.credential}
        />
      </div>
      <p className="help">W3C Verifiable Credential for Corroborating Event</p>
    </div>

      <div className="panel">
         The above is a W3C Verifiable Credential for a Corroborating Event. For example. checking evidence such as a utility bill or
          drivers license for a Residential Address.
      </div>

      <div className="panel">
          This has also been written to the Inbox of the Individual's Pod at <i>{props.webId}</i>.
      </div>


  </>;
};
