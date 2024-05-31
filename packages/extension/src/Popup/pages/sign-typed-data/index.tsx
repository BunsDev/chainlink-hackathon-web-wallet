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

enum Tab {
  Details = 'Details',
  Data = 'Data',
}

type SendTransactionPageProps = {
  typedData?: SignTypedDataV4Dto;
} & PromisePageProps<boolean>;

const SignTypedDataPage: React.FC<SendTransactionPageProps> = ({
  runtimeListen = false,
  typedData,
  onRejectCallback,
  onResolveCallback,
}) => {
  const [tab, setTab] = useState(Tab.Details);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [dataToSign, setTxToSign] = useState<SignTypedDataV4Dto>();

  const [pagePromise, pagePromiseFunctions] = usePagePromise<boolean>();

  const discardTx = () => {
    pagePromiseFunctions?.reject?.(getError(ErrorCodes.userRejected));
  };

  const approveTx = () => {
    if (dataToSign) pagePromiseFunctions.resolve?.(true);
  };

  const onTabMessage = useCallback(
    async (
      req: RuntimePostMessagePayload<
        EthereumRequestOverrideParams<SignTypedDataV4Dto>
      >
    ) => {
      if (!req.msg || !req.msg.params || !req.msg.params.length) {
        const err = getCustomError('Invalid payload');
        pagePromiseFunctions?.reject?.(err);
        throw err;
      }

      console.log('Sign data:', req.msg.params);
      setTxToSign(req.msg.params);
      setIsLoaded(true);
      return pagePromise;
    },
    [pagePromise, pagePromiseFunctions]
  );

  useEffect(() => {
    if (runtimeListen && !typedData) {
      newPopupOnMessage<
        boolean,
        EthereumRequestOverrideParams<SignTypedDataV4Dto>
      >(onTabMessage);

      return () => {
        Browser.runtime.onMessage.removeListener(onTabMessage);
      };
    } else {
      onTabMessage(
        new RuntimePostMessagePayload({
          destination: PostMessageDestination.NEW_POPUP,
          type: RuntimePostMessagePayloadType.EXTERNAL,
          msg: {
            method: 'eth_signTypedData_v4',
            params: typedData,
          } as EthereumRequestOverrideParams<SignTypedDataV4Dto>,
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
    typedData,
  ]);

  return (
    <div className="p-[24px] flex flex-col h-full">
      <div className="text-[24px] leading-[32px] font-bold">
        Confirm signing
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

export default SignTypedDataPage;
