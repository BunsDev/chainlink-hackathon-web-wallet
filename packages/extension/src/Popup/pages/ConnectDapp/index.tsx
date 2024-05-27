import React, { useEffect, useMemo, useState } from 'react';
import Browser, { commands } from 'webextension-polyfill';
import { getError } from '../../../lib/errors';
import {
  newPopupOnMessage,
  NewPopupWindowOnMessageCallback,
} from '../../../lib/message-bridge/bridge';
import {
  PostMessageDestination,
  RuntimeOnMessageResponse,
  RuntimePostMessagePayload,
} from '../../../lib/message-bridge/types';
import { ErrorCodes, EthereumRequest } from '../../../lib/providers/types';
import { usePagePromise } from '../../hooks/usePagePromise';
import { UserSelectedAccount } from '../../../lib/providers/background/methods/internal/initializeWallet';

export const ConnectDapp: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<UserSelectedAccount>();
  const account = useMemo(
    () =>
      selectedAccount
        ? {
            address: selectedAccount?.isUndasContractSelected
              ? selectedAccount.undasContract
              : selectedAccount?.address,
            isSmartAccount: selectedAccount?.isUndasContractSelected,
          }
        : undefined,
    [selectedAccount]
  );

  const [pagePromise, pagePromiseFunctions] = usePagePromise<boolean>();

  const discardConnect = () => {
    alert('discard');
    pagePromiseFunctions.reject?.(getError(ErrorCodes.userRejected));
  };

  const acceptConnect = () => {
    pagePromiseFunctions.resolve?.(true);
  };

  const onTabMessage = async (
    acc: RuntimePostMessagePayload<EthereumRequest<UserSelectedAccount>>
  ) => {
    setIsLoaded(true);
    setSelectedAccount(acc.msg?.params?.[0]);
    return pagePromise;
  };

  useEffect(() => {
    newPopupOnMessage<boolean, EthereumRequest<UserSelectedAccount>>(
      onTabMessage
    );

    return () => {
      // discardConnect()
      Browser.runtime.onMessage.removeListener(onTabMessage);
    };
  }, []);

  return (
    <>
      {!isLoaded ? (
        <>
          <span>Loading (Waiting for incoming request from BG)</span>
        </>
      ) : (
        <>
          <div>
            {account && <span>Connecting account {account.address}</span>}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
              <button onClick={discardConnect}>
                Discard
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={acceptConnect}
              >
                Connect Dapp
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
