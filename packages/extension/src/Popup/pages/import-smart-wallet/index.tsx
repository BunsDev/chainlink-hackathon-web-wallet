import React, { useContext, useState, useEffect, useCallback } from 'react';
import Browser, { runtime } from 'webextension-polyfill';
import { getCustomError, getError } from '../../../lib/errors';
import {
  newPopupOnMessage,
  sendRuntimeMessageToBackground,
} from '../../../lib/message-bridge/bridge';
import {
  PostMessageDestination,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../lib/message-bridge/types';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { GetAccountsDTO } from '../../../lib/providers/background/methods/internal/getUserAddresses';
import {
  ErrorCodes,
  EthereumRequest,
  EthereumRequestOverrideParams,
} from '../../../lib/providers/types';
import { Context } from '../../Context';
import { Marketplace__factory } from '../../testContractFactory/Marketplace__factory';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber, utils } from 'ethers';
import { usePagePromise } from '../../hooks/usePagePromise';
import { PromisePageProps } from '../../types';
import { formatUnits } from 'ethers/lib/utils';
import { cn } from '../../../lib/utils/cn';
import { ScrollArea } from '../../../components/scroll-area';
import { Button } from '../../../components/button';
import { SendTransactionRequestDTO } from '../../../lib/providers/background/methods/external/eth_sendTransaction';
import { SignTypedDataV4Dto } from '../../../lib/providers/background/methods/external/eth_signTypedData_v4';
import { ImportSmartWalletPayloadDTO } from '../../../lib/providers/background/methods/internal/importSmartWallet';
import { useUserAccounts } from '../../hooks/read/use-user-accounts';

enum Tab {
  Details = 'Details',
  Data = 'Data',
}

type ImportSmartWalletPageProps = {
  payload?: ImportSmartWalletPayloadDTO;
} & PromisePageProps<boolean>;

const ImportSmartWalletDataPage: React.FC<ImportSmartWalletPageProps> = ({
  runtimeListen = false,
  payload,
  onRejectCallback,
  onResolveCallback,
}) => {
  const [tab, setTab] = useState(Tab.Details);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [importAccount, setTxToSign] = useState<ImportSmartWalletPayloadDTO>();
  const { data: useAccounts } = useUserAccounts();

  const [pagePromise, pagePromiseFunctions] = usePagePromise<boolean>();

  const discardTx = () => {
    pagePromiseFunctions?.resolve?.(false);
  };

  const approveTx = () => {
    if (importAccount) pagePromiseFunctions.resolve?.(true);
  };

  const onTabMessage = useCallback(
    async (
      req: RuntimePostMessagePayload<
        EthereumRequest<ImportSmartWalletPayloadDTO>
      >
    ) => {
      if (!req.msg || !req.msg.params || !req.msg.params.length) {
        const err = getCustomError('Invalid payload');
        pagePromiseFunctions?.reject?.(err);
        throw err;
      }

      console.log('Sign data:', req.msg.params);
      setTxToSign(req.msg.params[0]);
      setIsLoaded(true);
      return pagePromise;
    },
    [pagePromise, pagePromiseFunctions]
  );

  useEffect(() => {
    if (runtimeListen && !payload) {
      newPopupOnMessage<boolean, EthereumRequest<ImportSmartWalletPayloadDTO>>(
        onTabMessage
      );

      return () => {
        Browser.runtime.onMessage.removeListener(onTabMessage);
      };
    } else {
      onTabMessage(
        new RuntimePostMessagePayload({
          destination: PostMessageDestination.NEW_POPUP,
          type: RuntimePostMessagePayloadType.EXTERNAL,
          msg: {
            method: 'wallet_importSmartWallet',
            params: payload,
          } as EthereumRequest<ImportSmartWalletPayloadDTO>,
        })
      )
        .then(onResolveCallback ?? (() => {}))
        .catch(onRejectCallback ?? (() => {}));
    }
  }, [
    onRejectCallback,
    onResolveCallback,
    onTabMessage,
    runtimeListen,
    payload,
  ]);

  return (
    <div className="p-[24px] flex flex-col h-full">
      <div className="text-[24px] leading-[32px] font-bold">
        Confirm importing smart wallet account
      </div>

      <div className="text-[24px] leading-[32px] font-bold">
        Smart wallet: {payload?.address}
      </div>

      <div className="text-[24px] leading-[32px] font-bold">
        Master wallet:{' '}
        {!!useAccounts?.selectedAccount?.masterWallet
          ? useAccounts?.selectedAccount?.masterWallet
          : useAccounts?.selectedAccount?.address}
      </div>
      <div className="flex items-center gap-[24px]">
        <Button variant="outline" className="flex-1" onClick={discardTx}>
          Reject
        </Button>
        <Button className="flex-1" onClick={approveTx}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default ImportSmartWalletDataPage;
