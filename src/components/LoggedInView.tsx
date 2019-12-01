import React from 'react';
import { useWebId, LogoutButton } from "@solid/react";
import { Route } from "react-router";
import { usePersonDetails } from '../services/usePersonDetails';
// main logged in view panels are:
// top left:
import { CurrentUser } from './CurrentUser';
// mid top:
import { Search } from './Search';
// left nav:
import { DiscoverableLists } from './PersonLists';
// main area:
import { MainPanel } from './MainPanel';
// footer:
import { Footer } from './Footer';

export const LoggedInView: React.FC<{}> = () => {
  const myWebId = useWebId();
  const myPersonDetails = usePersonDetails(myWebId || null, true);
  if (myPersonDetails === null) {
    return <>Loading...</>;
  } else if (myPersonDetails === undefined) {
    return <>(could not fetch profile of logged-in user)</>;
  }

  return <>
      <div className="container">
      <nav className="navbar has-shadow">
        <CurrentUser />
        <div className="navbar-end">
          <div className="navbar-item">
            <Search onSelect={(webId: string) => {
            window.location.href = `/profile/${encodeURIComponent(webId)}`;
            }}/>
          </div>
          <div className="navbar-item">
            <LogoutButton className="button is-primary"/>
          </div>
        </div>
      </nav>
  
    <section className="main-content columns is-fullheight">
      <aside className="column is-4 is-narrow-mobile is-fullheight section is-hidden-mobile">
        <DiscoverableLists />
      </aside>
      <Route path="/profile/:webId">
        <div className="container column is-8">
          <div className="section">
            <div className="card">
              <MainPanel />
            </div>
          </div>
        </div>
      </Route>
    </section>
    <Footer />
   </div>
  </>;
}