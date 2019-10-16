import React from 'react';
import { useParams } from 'react-router';

interface PathParams {
  webId: string;
};

export const Profile: React.FC = (props) => {
  const params = useParams<PathParams>();
  const webId = decodeURIComponent(params.webId);

  return <>
    This page will list the friends of {webId} visible to you.
  </>;
};
