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
          <p className="content">This app requires you to log in. It requires <b>Control</b> access.</p>
          <LoginButton popup="popup.html" className="button is-large is-primary">Log in to start using</LoginButton>
        </section>
      </LoggedOut>
      <LoggedIn>
        <div className="panel">
          Logged in as {useWebId()}.&nbsp;
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
