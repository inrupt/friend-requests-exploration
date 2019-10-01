import React from 'react';
import { TripleSubject } from 'tripledoc';
import { vcard } from 'rdf-namespaces';

interface Props {
  friendlist: TripleSubject;
};

export const Friendlist: React.FC<Props> = (props) => {
  const friendElements = <p>Unfortunately, you haven't added any friends yet :(</p>;

  return <>
    <h2 className="title">
      {props.friendlist.getLiteral(vcard.fn)}
    </h2>
    {friendElements}
  </>;
};
