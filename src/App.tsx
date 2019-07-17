import React from 'react';
import { LoggedOut, LoginButton, LoggedIn } from '@solid/react';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return <>
    <LoggedOut>
      <section className="section">
        <p className="content">Please login in to your Pod to start keeping track of the movies you have seen.</p>
        <p className="content">
          <LoginButton popup="popup.html" className="button is-large is-primary">Log in</LoginButton>
        </p>
      </section>
    </LoggedOut>
    <LoggedIn>
      <Dashboard/>
    </LoggedIn>
  </>;
}

export default App;
