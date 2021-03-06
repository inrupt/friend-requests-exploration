import React from 'react';
import { usePersonDetails, PersonDetails } from '../services/usePersonDetails';
import { PersonSummary } from './PersonLists';

export const Footer: React.FC<{}> = () => {
  const EXPLORERS = [
    usePersonDetails('https://sharonstrats.inrupt.net/profile/card#me') || 'https://sharonstrats.inrupt.net/profile/card#me',
    usePersonDetails('https://vincentt.inrupt.net/profile/card#me') || 'https://vincentt.inrupt.net/profile/card#me',
    usePersonDetails('https://michielbdejong.inrupt.net/profile/card#me') || 'https://michielbdejong.inrupt.net/profile/card#me'
  ];
  
  const cards = EXPLORERS.map((details: PersonDetails | string) => {
    if (typeof details === 'string') {
      return <p>{details}</p>;
    }
    return (
      <div className="column is-4">
        <PersonSummary details={details} />
      </div>
    );
  });

  return <footer className="footer">
    <div className="container is-centered">
      <div className="content">
        <p className="has-text-centered"><strong>Explorers</strong></p>
        
        <div className="panel-block">
          {cards}
          </div>
        </div>
      
    </div>
  </footer>;
}