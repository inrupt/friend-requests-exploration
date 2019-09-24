import React from 'react';

interface Props {
  credential: string;
};

export const Credential: React.FC<Props> = (props) => {
  return <>
    <div className="field">
      <label htmlFor="subject" className="label">Credential</label>
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
      <p className="help">The above code snippet is proof that you provided a credential.</p>
    </div>
    <p className="content">This proof has also been sent to the credential subject.</p>
  </>;
};
