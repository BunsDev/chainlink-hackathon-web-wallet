import React, { useCallback, useEffect } from 'react';
import Browser from 'webextension-polyfill';
import { getError } from '../../../lib/errors';
import { newPopupOnMessage } from '../../../lib/message-bridge/bridge';
import { RuntimePostMessagePayload } from '../../../lib/message-bridge/types';
import { ErrorCodes, EthereumRequest } from '../../../lib/providers/types';
import { usePagePromise } from '../../hooks/usePagePromise';
import { UserSelectedAccount } from '../../../lib/providers/background/methods/internal/initializeWallet';
import { useUserAccounts } from '../../hooks/read/use-user-accounts';
import { shortenAddress } from '../../../lib/utils/address';
import { Button } from '../../../components/button';

export const ConnectDapp: React.FC = () => {
  const { data } = useUserAccounts();

  const [pagePromise, pagePromiseFunctions] = usePagePromise<boolean>();

  const discardConnect = () => {
    pagePromiseFunctions.reject?.(getError(ErrorCodes.userRejected));
  };

  const acceptConnect = () => {
    pagePromiseFunctions.resolve?.(true);
  };

  const onTabMessage = useCallback(
    async (
      acc: RuntimePostMessagePayload<EthereumRequest<UserSelectedAccount>>
    ) => {
      return pagePromise;
    },
    [pagePromise]
  );

  useEffect(() => {
    newPopupOnMessage<boolean, EthereumRequest<UserSelectedAccount>>(
      onTabMessage
    );

    return () => {
      // discardConnect()
      Browser.runtime.onMessage.removeListener(onTabMessage);
    };
  }, [onTabMessage]);

  return (
    <div className="flex flex-col gap-[24px] h-full">
      <div className="flex flex-col gap-[16px]">
        <div className="text-[24px] leading-[32px] font-bold">
          Connection request
        </div>
        <div className="text-[16px] leading-[24px] text-muted-foreground">
          A website is requesting to connect to your wallet
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-[22px] p-[16px] flex flex-col gap-[2px]">
          <div className="text-[12px] leading-[20px] font-medium">
            {data?.selectedAccount?.isSmartContract
              ? 'Smart Contract'
              : 'Master account'}
          </div>
          <div className="text-[15px] leading-[24px] text-muted-foreground">
            {shortenAddress(data?.selectedAccount?.address ?? '', 5)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[24px]">
        <Button className="flex-1" variant="outline" onClick={discardConnect}>
          Reject
        </Button>
        <Button className="flex-1" onClick={acceptConnect}>
          Accept
        </Button>
      </div>
    </div>
  );
};
