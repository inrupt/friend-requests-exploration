import React from 'react';
import { Router } from '@reach/router';
import { Home } from './pages/Home';
import { Consumer } from './pages/Consumer';
import { Publisher } from './pages/Publisher';

const App: React.FC = () => {
  return <>
    <Router>
      <Home path="/"/>
      <Consumer path="consumer"/>
      <Publisher path="publisher"/>
    </Router>
  </>;
}

export default App;
