import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Context } from './Context';
import MainPage from './pages/MainPage/MainPage';
import { Wallet } from 'ethers';
import EnterPasswordPage from './pages/EnterPasswordPage/EnterPasswordPage';
import CreateWalletPage from './pages/CreateWalletPage/CreateWallet';
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
import { WelcomePage } from './pages/welcome-page';
import { CreatePasswordPage } from './pages/create-password-page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnterMnemonicPage } from './pages/enter-mnemonic-page';
import { HomePage } from './pages/home-page';
import { GenerateContractPage } from './pages/generate-contract-page';
import SignTypedDataPage from './pages/sign-typed-data';
import { Toaster } from 'react-hot-toast';
import ImportSmartWalletDataPage from './pages/import-smart-wallet';
import SwitchChainDataPage from './pages/switch-chain';

function Popup() {
  const [queryClient] = useState(() => new QueryClient());
  const [loggedIn, setLoggedIn] = useState(false);
  const [signer, setSigner] = useState<Wallet>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    sendRuntimeMessageToBackground<EthereumRequest, boolean>(
      {
        method: InternalBgMethods.IS_WALLET_INITIALIZED,
      },
      RuntimePostMessagePayloadType.INTERNAL
    ).then((v) => {
      if (!v.result && location.pathname !== '/' + UIRoutes.welcome.path) {
        window.close();
        Browser.tabs.create({
          active: true,
          url: getPopupPath(UIRoutes.welcome.path),
        });
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading ? (
        <Loading />
      ) : (
        <Context.Provider
          value={{
            loggedIn,
            setLoggedIn,
            signer,
            setSigner,
          }}
        >
          <div className="h-full font-sans">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path={'/' + UIRoutes.loading.path}
                element={<Loading />}
              ></Route>
              <Route
                path={'/' + UIRoutes.initializeWallet.path}
                element={<InitializeWallet />}
              ></Route>
              <Route
                path={'/' + UIRoutes.ethConnectDApp.path}
                element={<ConnectDapp />}
              ></Route>
              <Route
                path={'/' + UIRoutes.welcome.path}
                element={<WelcomePage />}
              />
              <Route
                path={'/' + UIRoutes.createPassword.path}
                element={<CreatePasswordPage />}
              />
              <Route
                path={'/' + UIRoutes.enterMnemonic.path}
                element={<EnterMnemonicPage />}
              />
              <Route
                path={'/' + UIRoutes.generateContract.path}
                element={<GenerateContractPage />}
              />
              <Route
                path={'/' + UIRoutes.ethSendTransaction.path}
                element={<SendTransactionPage runtimeListen={true} />}
              ></Route>
              <Route
                path={'/' + UIRoutes.ethSignTypedData.path}
                element={<SignTypedDataPage runtimeListen={true} />}
              ></Route>
              <Route
                path={'/' + UIRoutes.walletImportSmartWallet.path}
                element={<ImportSmartWalletDataPage runtimeListen={true} />}
              ></Route>
              <Route
                path={'/' + UIRoutes.ethSwitchChain.path}
                element={<SwitchChainDataPage runtimeListen={true} />}
              ></Route>
              <Route
                path="/create-wallet"
                element={<CreateWalletPage />}
              ></Route>
              <Route
                path="/enter-password"
                element={<EnterPasswordPage />}
              ></Route>
              <Route path="/login-page" element={<LoginPage />}></Route>
            </Routes>
            <Toaster />
          </div>
        </Context.Provider>
      )}
    </QueryClientProvider>
  );
}

export default Popup;
