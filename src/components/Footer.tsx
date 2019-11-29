import React from 'react';
import { usePersonDetails, PersonDetails } from '../services/usePersonDetails';
import { PersonSummary } from './PersonLists';

export const Footer: React.FC<{}> = () => {
  const INRUPT_APPS_TEAM = [
    usePersonDetails('https://sharonstrats.inrupt.net/profile/card#me') || 'https://sharonstrats.inrupt.net/profile/card#me',
    usePersonDetails('https://vincentt.inrupt.net/profile/card#me') || 'https://vincentt.inrupt.net/profile/card#me',
    usePersonDetails('https://michielbdejong.inrupt.net/profile/card#me') || 'https://michielbdejong.inrupt.net/profile/card#me'
  ];
  
  const cards = INRUPT_APPS_TEAM.map((details: PersonDetails | string) => {
    if (typeof details === 'string') {
      return <p>{details}</p>;
    }
    return <PersonSummary details={details} />;
  });

  return <footer className="footer">
    <div className="container">
      <div className="content has-text-centered">
        <p><b>Inrupt Apps Team</b></p>
        <div className="panel-block center">{cards}</div>
      </div>
    </div>
  </footer>;
}