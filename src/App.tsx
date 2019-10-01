import React from 'react';
import { FriendLists } from './components/FriendLists';
import { LoggedOut, LoginButton, LoggedIn } from '@solid/react';

const App: React.FC = () => {
  return <>
    <LoggedOut>
      <section className="section">
        <p className="content">This app requires you to log in. It requires <b>Control</b> access.</p>
        <LoginButton popup="popup.html" className="button is-large is-primary">Log in to start using</LoginButton>
      </section>
    </LoggedOut>
    <LoggedIn>
      <FriendLists/>
    </LoggedIn>
  </>;
}

export default App;
