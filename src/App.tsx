import React from 'react';
import { IncomingList } from './components/IncomingList';
import { FriendList } from './components/FriendList';
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
      <div className="panel">
        <IncomingList/>
      </div>
      <div className="panel">
         <FriendList/>
      </div>
    </LoggedIn>
  </>;
}

export default App;
