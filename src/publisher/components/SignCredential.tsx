import React from 'react';
import { mockCredential } from './mockCredential';

interface Props {
  onSign: (signedCredential: string, subjectWebId: string) => void;
};

export const SignCredential: React.FC<Props> = (props) => {
  const [webId, setWebId] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const onSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsProcessing(true);
    props.onSign(mockCredential, webId);
  }, [props, webId]);

  const buttonClass = isProcessing ? 'button is-primary is-loading' : 'button is-primary';

  return <>
    <form onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="subject" className="label">WebID of Individual</label>
        <div className="control">
          <input
            type="url"
            id="subject"
            disabled={isProcessing}
            onChange={(event) => setWebId(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button type="submit" className={buttonClass}>Publish Corroborating Event</button>
        </div>
      </div>
    </form>
  </>;
};
