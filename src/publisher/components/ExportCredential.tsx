import React from 'react';
import { mockCredential } from './mockCredential';

interface Props {
  credential: string;
};

export const ExportCredential: React.FC<Props> = (props) => {
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
        >
          {props.credential}
        </textarea>
      </div>
      <p className="help">The above code snippet is proof that you provided a credential.</p>
    </div>
  </>;
};
