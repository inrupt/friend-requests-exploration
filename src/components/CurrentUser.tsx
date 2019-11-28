import React from 'react';
import { useWebId } from "@solid/react";
import { PersonSummary } from './PersonLists';

export const CurrentUser: React.FC<{}> = () => {
  const myWebId = useWebId();
  return <div className="navbar-start">
    You: <PersonSummary webId={myWebId || undefined} />
  </div>;
}