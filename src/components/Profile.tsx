import React from 'react';
import { useParams } from 'react-router';
import { MainPanel } from './Person';
import { usePersonDetails } from '../services/usePersonDetails';

interface PathParams {
  webId: string;
};

export const Profile: React.FC = (props) => {
  const params = { webId: '' }; // useParams<PathParams>();
  const webId = decodeURIComponent(params.webId);
  const theirDetails = usePersonDetails(webId);
  if (theirDetails === null) {
    return <>Loading...</>;
  }
  if (theirDetails === undefined) {
    return <>(failed to load person details).</>;
  }
  if (theirDetails.friends === null) {
    return <>
      <section className="section">
        <p className="content">
          This person does not have any friends that are visible to you.
        </p>
      </section>
    </>;
  }

  if (theirDetails.friends === undefined) {
    return <>
      <section className="section">
        <p className="content">
          Loading&hellip;
        </p>
      </section>
    </>;
  }

  const profiles = Array.from(theirDetails.friends).map((friendRef) => {
    return (
      <section key={friendRef} className="section">
        <div className="card">
          <div className="section">
            <MainPanel webId={friendRef}/>
          </div>
        </div>
      </section>
    );
  });

  return <>
    <section className="header">
      <h2>Friends of {webId}:</h2>
    </section>
    {profiles}
  </>;
};
