import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';

import Popup from './Popup';
import './index.css';

const root = window.document.querySelector('#app-container')!;
createRoot(root).render(
  <React.StrictMode>
    <Router>
      <Popup />
    </Router>
  </React.StrictMode>
);

if ((module as any).hot) (module as any).hot.accept();
