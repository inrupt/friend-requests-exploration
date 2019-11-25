import { useWebId, LogoutButton } from "@solid/react";
import { Route } from "react-router";
import { usePersonDetails } from '../services/usePersonDetails';
import { MainPanel, PersonSummary } from './Person';
import { FriendSelector } from './FriendSelector';
import { IncomingList } from './IncomingList';
import { FriendList } from './Friendlist';

export const LoggedInView: React.FC<{}> = () => {
  const myWebId = useWebId() || null;
  const myPersonDetails = usePersonDetails(myWebId, true);
  if (myPersonDetails === undefined) {
    return <>Loading...</>;
  }
  if (myPersonDetails === null) {
    return <>(could not fetch profile of logged-in user)</>;
  }

  return <>
      <div className="container">
      <nav className="navbar has-shadow">
        <div className="navbar-start">
        You: <PersonSummary webId={myWebId || undefined} />
        </div>
        <div className="panel-block">
          <FriendSelector onSelect={(webId: string) => {
            window.location.href = `/profile/${encodeURIComponent(webId)}`;
          }}/>
        </div>
        <div className="navbar-end">
          <LogoutButton className="button is-primary"/>
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
    <footer className="footer is-hidden">
      <div className="container">
        <div className="content has-text-centered">
          <p>Hello</p>
        </div>
      </div>
    </footer>
  </>;
}