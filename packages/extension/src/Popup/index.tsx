import React from 'react';
import { render } from 'react-dom';
import { HashRouter as Router } from 'react-router-dom';

import Popup from './Popup';
import './index.css';
import { newPopupOnMessage, popupOnMessage } from '../lib/message-bridge/bridge';
import { EthereumRequest } from '../lib/providers/types';
import { RuntimeOnMessageResponse, RuntimePostMessagePayload } from '../lib/message-bridge/types';

render(
  <React.StrictMode>
    <Router>
      <Popup />
    </Router>
  </React.StrictMode>,
  window.document.querySelector('#app-container')
);

if ((module as any).hot) (module as any).hot.accept();

// newPopupOnMessage((req: RuntimePostMessagePayload<EthereumRequest>) => {
//   return new Promise<RuntimeOnMessageResponse>((resolve) => {
//     console.log('newPopupOnMessage', req.msg);

//     setTimeout(() => resolve({
//       result: ['0xEC227cFE7485b9423B7e2eb30b813c7b5413a0f2']
//     }), 5000)
//   })
// })