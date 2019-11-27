import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LoggedOut, LoginButton, LoggedIn } from '@solid/react';
import { LoggedInView } from './components/LoggedInView';

const App: React.FC = () => {
  return <>
    <React.StrictMode>
      <BrowserRouter>
        <LoggedOut>
          <section className="section">
            <h1 className="title">Friend Requests Exploration</h1>
            <p className="subtitle">This app requires you to log in.
            Unless launched from the <a href="https://launcher-exploration.inrupt.app/">Launcher app</a>,
            it requires pod-wide <strong>Control</strong> access.</p>
            <LoginButton popup="/popup.html" className="button is-large is-primary">Log in to start using this app</LoginButton>
          </section>
        </LoggedOut>
        <LoggedIn>
          <LoggedInView />
        </LoggedIn>
      </BrowserRouter>
    </React.StrictMode>
  </>;
}

export default App;
