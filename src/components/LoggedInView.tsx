import React from 'react';
import { useWebId, LogoutButton } from "@solid/react";
import { Route } from "react-router";
import { usePersonDetails } from '../services/usePersonDetails';
import { notifyMe, MessageFormatter } from '../services/desktopNotif';

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
import { determineInboxesToUse } from '../services/sendActionNotification';
import { checkInbox } from '../services/useIncomingFriendRequests';

async function subscribeToInboxes(myWebId: string) {
  const myInboxUrls: string[] = await determineInboxesToUse(myWebId);
  myInboxUrls.map(async (inboxUrl: string) => {
    notifyMe(inboxUrl, (async (url: string, isSub: boolean) => {
      if (isSub) {
        return `Subscribed to your Solid inbox, ${inboxUrl}`;
      }
      const filtered = await checkInbox(inboxUrl);
      if (filtered.length === 1) {
        return `New Friend Frequest, ${filtered[0].webId}`;
      }
      if (filtered.length > 1) {
        return `New Friend Frequests including ${filtered[0].webId}`;
      }
      console.log('Unrecognized item in your Solid inbox', myWebId);
      return 'Unrecognized item in your Solid inbox';
    }) as MessageFormatter);
  });
}

export const LoggedInView: React.FC<{}> = () => {
  const myWebId = useWebId();
  const myPersonDetails = usePersonDetails(myWebId || null, true);
  if (myPersonDetails === null) {
    return <>Loading...</>;
  } else if (myPersonDetails === undefined) {
    return <>(could not fetch profile of logged-in user)</>;
  }
  void subscribeToInboxes(myPersonDetails.webId);

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