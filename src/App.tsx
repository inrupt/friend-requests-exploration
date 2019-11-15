import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { IncomingList } from './components/IncomingList';
import { FriendLists } from './components/FriendLists';
import { LoggedOut, LoginButton, LoggedIn, LogoutButton, useWebId } from '@solid/react';
import { Profile } from './components/Profile';

const App: React.FC = () => {
  return <>
    <Router>
      <LoggedOut>
        <section className="section">
          <h1 className="title">Friend Requests Exploration</h1>
          <p className="subtitle">This app requires you to log in.
          Unless launched from the <a href="https://launcher-exploration.inrupt.app/">Launcher app</a>,
          it requires pod-wide <strong>Control</strong> access.</p>
          <LoginButton popup="popup.html" className="button is-large is-primary">Log in to start using this app</LoginButton>
        </section>
      </LoggedOut>
      <LoggedIn>
        <div className="panel">
          <p className="subtitle">Logged in as {useWebId()}.</p>
          <LogoutButton className="button is-warning" />
        </div>
        <Switch>
          <Route path="/profile/:webId">
            <Profile/>
          </Route>
          <Route path="/">
            <div className="panel">
              <IncomingList/>
            </div>
            <div className="panel">
              <FriendLists/>
            </div>
          </Route>
        </Switch>
      </LoggedIn>
    </Router>
  </>;
}

export default App;
