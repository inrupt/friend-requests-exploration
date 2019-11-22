import React from 'react';
import {
<<<<<<< HEAD
  BrowserRouter as Router,
=======
  BrowserRouter as Router
>>>>>>> origin/master
} from 'react-router-dom';
import { IncomingList } from './components/IncomingList';
import { LoggedOut, LoginButton, LoggedIn, LogoutButton, useWebId } from '@solid/react';
<<<<<<< HEAD
=======
//import { Profile } from './components/Profile';
>>>>>>> origin/master
import { Person, PersonSummary } from './components/Person';
import { FriendList } from './components/Friendlist';

const App: React.FC = () => {
  return <>
    <React.StrictMode>
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
          <div className="container">
            <nav className="navbar has-shadow">
              <div className="navbar-start">
                <PersonSummary webId={(useWebId() || undefined)} />
              </div>
              <div className="navbar-end">
                <LogoutButton className="button is-primary"/>
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
            </nav>
          </div>
          <section className="main-content columns is-fullheight">
            <aside className="column is-4 is-narrow-mobile is-fullheight section is-hidden-mobile">
  
              <div className="menu-list">

                <nav className="panel">
                  <IncomingList />
                </nav>
                <nav className="panel">
                  <FriendList />
                </nav>
              </div>
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
    </React.StrictMode>
  </>;
}

export default App;
