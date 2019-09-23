import React from 'react';
import { mockCredential } from './mockCredential';

interface Props {
  onSign: (signedCredential: string) => void;
};

export const SignCredential: React.FC<Props> = (props) => {
  const [webId, setWebId] = React.useState('');

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    props.onSign(mockCredential);
  };

  return <>
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="subject" className="label">Subject's WebID</label>
        <div className="control">
          <input
            type="url"
            id="subject"
            onChange={(event) => setWebId(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-primary">Sign</button>
        </div>
      </div>
    </form>
  </>;
};
