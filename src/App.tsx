import React from 'react';
import { Router } from '@reach/router';
import { Home } from './pages/Home';
import { Consumer } from './pages/Consumer';
import { Publisher } from './pages/Publisher';

const basepath = process.env.NODE_ENV === 'production' ? '/demo-vc' : '';

const App: React.FC = () => {
  return <>
    <Router basepath={basepath}>
      <Home path="/"/>
      <Consumer path="consumer"/>
      <Publisher path="publisher"/>
    </Router>
  </>;
}

export default App;
