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
import { Person, PersonSummary } from './components/Person';

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
        <nav className="nav has-shadow">
          <div className="container">
            <div className="nav-left">
              <a className="nav-item">
                Website
              </a>
            </div>
            <div className="nav-toggle">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <input type="checkbox" id="menu-toggle" className="is-hidden"/>
            <div className="nav-right nav-menu">
              <a className="nav-item is-tab is-hidden-tablet">
                <span className="icon"><i className="fa fa-home"></i></span> You
              </a>
              <a className="nav-item is-tab is-hidden-tablet">
                <span className="icon"><i className="fa fa-table"></i></span> Pending
              </a>
              <a className="nav-item is-tab is-hidden-tablet">
                <span className="icon"><i className="fa fa-info"></i></span> Friends
              </a>
              <a className="nav-item is-tab is-hidden-tablet">
                <span className="icon"><i className="fa fa-info"></i></span> Blocked
              </a>
              
              <a className="nav-item is-tab is-active">
                <span className="icon"><i className="fa fa-user"></i></span>
              </a>
              <a className="nav-item is-tab">
                <span className="icon"><i className="fa fa-sign-out"></i></span>
              </a>
            </div>
          </div>
        </nav>
        <section className="main-content columns is-fullheight">
          <aside className="column is-4 is-narrow-mobile is-fullheight section is-hidden-mobile">
            <p className="menu-label is-hidden-touch">Navigation</p>
            <ul className="menu-list">
                <PersonSummary webId={(useWebId() || undefined)} />
              <li>
                <IncomingList />
              </li>
              <li>
                <FriendLists />
              </li>
            </ul>
          </aside>
          <div className="container column is-8">
            <div className="section">
              <div className="card">
                <Person webId={(useWebId() || undefined)} />                    
              </div>
              </div>
          </div>
        </section>
        <footer className="footer is-hidden">
          <div className="container">
            <div className="content has-text-centered">
              <p>Hello</p>
            </div>
          </div>
        </footer>
      </LoggedIn>
    </Router>
  </>;
}

export default App;
