import React from 'react';

interface Props {
  onSelect: (webId: string) => void;
};

export const FriendSelector: React.FC<Props> = (props) => {
  const [webId, setWebId] = React.useState('');

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebId(event.target.value);
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.onSelect(webId);
    setWebId('');
  };

  return <>
    <form onSubmit={onSubmit}>
      <div className="field">
        <div className="control">
          <input className="input is-large" onChange={onChange} value={webId} type="url" name="webid" id="webid"/>
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button type="submit" className="button is-primary">Add</button>
        </div>
      </div>
    </form>
  </>;
};
