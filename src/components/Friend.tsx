import React from 'react';

interface Props {
  webId: string;
};

export const Friend: React.FC<Props> = (props) => {
  return <>
    <div className="card">
      <div className="section">
        {props.webId}
      </div>
    </div>
  </>;
};
