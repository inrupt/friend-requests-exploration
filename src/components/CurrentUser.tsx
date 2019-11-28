import React from 'react';
import { useWebId } from "@solid/react";
import { PersonSummary } from './PersonLists';
import { usePersonDetails } from '../services/usePersonDetails';

export const CurrentUser: React.FC<{}> = () => {
  const myWebId = useWebId() || null;
  const myPersonDetails = usePersonDetails(myWebId);
  if (myPersonDetails) {
    return <div className="navbar-start">
      You: <PersonSummary details={myPersonDetails} />
    </div>;
  }
  if (myWebId) {
    return <div className="navbar-start">
      You: <code>{myWebId}</code>>
    </div>;
  }
  return <div className="navbar-start">
    (loading your profile...)
  </div>;
}