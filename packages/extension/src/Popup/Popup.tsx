import './Popup.css';

import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Context } from './Context';
import AuthenticationPage from './pages/AuthenticationPage/AuthenticationPage';
import MainPage from './pages/MainPage/MainPage';
import { Wallet } from 'ethers';
import EnterPasswordPage from './pages/EnterPasswordPage/EnterPasswordPage';
import CreateWalletPage from './pages/CreateWalletPage/CreateWallet';
import { isPresentCryptedPrivateKeyAtStorage } from './storageUtils/utils';
import LoginPage from './pages/LoginPage/LoginPage';
import { ConnectDapp } from './pages/ConnectDapp';
import { Loading } from './pages/Loading';
import { getPopupPath, UIRoutes } from '../lib/popup-routes';
import { sendRuntimeMessageToBackground } from '../lib/message-bridge/bridge';
import { EthereumRequest } from '../lib/providers/types';
import { InternalBgMethods } from '../lib/message-handlers/background-message-handler';
import Browser from 'webextension-polyfill';
import { InitializeWallet } from './pages/InitializeWallet';
import { RuntimePostMessagePayloadType } from '../lib/message-bridge/types';
import SendTransactionPage from './pages/SendTransaction';

function Popup() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [accountPrivateKey, setAccountPrivateKey] = useState<any>();
  const [signer, setSigner] = useState<Wallet>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation()

  useEffect(() => {
    sendRuntimeMessageToBackground<EthereumRequest, boolean>({
      method: InternalBgMethods.IS_WALLET_INITIALIZED
    }, RuntimePostMessagePayloadType.INTERNAL).then(v => {
      if (!v.result && location.pathname !== ('/' + UIRoutes.initializeWallet.path)) {
        window.close();
        Browser.tabs.create({
          active: true,
          url: getPopupPath(UIRoutes.initializeWallet.path)
        })
      } else {
        setIsLoading(false);
      }
    });
  }, [])

  useEffect(() => {
    const getUsers = async () => {
      const aesPk = await isPresentCryptedPrivateKeyAtStorage();
      setAccountPrivateKey(aesPk);
    };

    getUsers();

    // if (signer) {
    //   // navigate('/main');
    // } else if (accountPrivateKey) {
    //   navigate('./enter-password');
    // } else {
    //   navigate('./');
    // }
  }, [accountPrivateKey, loggedIn, signer]);



  return (
    <>
      {
        isLoading ?
          <Loading /> :
          <Context.Provider
            value={{
              loggedIn,
              setLoggedIn,
              signer,
              setSigner,
            }}
          >
            <div>
              <Routes>
                <Route path="/" element={<MainPage />}></Route>
                <Route path={'/' + UIRoutes.loading.path} element={<Loading />}></Route>
                <Route path={'/' + UIRoutes.initializeWallet.path} element={<InitializeWallet />}></Route>
                <Route path={'/' + UIRoutes.ethConnectDApp.path} element={<ConnectDapp />}></Route>
                <Route path={'/' + UIRoutes.ethSendTransaction.path} element={<SendTransactionPage runtimeListen={true} />}></Route>
                <Route path="/create-wallet" element={<CreateWalletPage />}></Route>
                <Route
                  path="/enter-password"
                  element={<EnterPasswordPage />}
                ></Route>
                <Route path="/login-page" element={<LoginPage />}></Route>
              </Routes>
            </div>
          </Context.Provider>
      }

    </>
  );
}

export default Popup;
