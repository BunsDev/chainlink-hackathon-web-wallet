import React, { useContext, useState, useEffect } from 'react';
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
import { ErrorCodes, EthereumRequest } from '../../../lib/providers/types';
import { Context } from '../../Context';
import { Marketplace__factory } from '../../testContractFactory/Marketplace__factory';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { BigNumber, utils } from 'ethers';
import { usePagePromise } from '../../hooks/usePagePromise';
import { PromisePageProps } from '../../types';

type SendTransactionPageProps = {
  tx?: TransactionRequest;
} & PromisePageProps<TransactionRequest>;

const SendTransactionPage: React.FC<SendTransactionPageProps> = ({
  runtimeListen = false,
  tx,
  onRejectCallback,
  onResolveCallback,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [txToSign, setTxToSign] = useState<TransactionRequest>();

  const [pagePromise, pagePromiseFunctions] =
    usePagePromise<TransactionRequest>();

  const discardTx = () => {
    pagePromiseFunctions?.reject?.(getError(ErrorCodes.userRejected));
  };

  const approveTx = () => {
    if (txToSign) pagePromiseFunctions.resolve?.(txToSign);
  };

  const onTabMessage = async (
    req: RuntimePostMessagePayload<EthereumRequest<TransactionRequest>>
  ) => {
    if (!req.msg || !req.msg.params || !req.msg.params.length) {
      const err = getCustomError('Invalid payload');
      pagePromiseFunctions?.reject?.(err);
      throw err;
    }

    const [tx] = req.msg.params;

    console.log('Transaction:', tx);
    setTxToSign(tx);
    setIsLoaded(true);
    return pagePromise;
  };

  const calcEstimatedTxCost = (tx: TransactionRequest) => {
    const gas = BigNumber.from(tx.gasLimit ?? 0);
    const gasPrice = BigNumber.from(tx.gasPrice ?? 0);
    const value = BigNumber.from(tx.gasPrice ?? 0);

    return gas.mul(gasPrice).add(value);
  };

  if (runtimeListen && !tx) {
    useEffect(() => {
      newPopupOnMessage<
        TransactionRequest,
        EthereumRequest<TransactionRequest>
      >(onTabMessage);

      return () => {
        Browser.runtime.onMessage.removeListener(onTabMessage);
      };
    }, []);
  } else {
    useEffect(() => {
      onTabMessage(
        new RuntimePostMessagePayload({
          destination: PostMessageDestination.NEW_POPUP,
          type: RuntimePostMessagePayloadType.EXTERNAL,
          msg: {
            method: 'eth_sendTransaction',
            params: [tx],
          } as EthereumRequest<TransactionRequest>,
        })
      )
        .then(onResolveCallback ?? (() => {}))
        .catch(onRejectCallback ?? (() => {}));
    }, []);
  }

  return (
    <div>
      <div className="flex flex-col w-2/5" style={{ width: '100%' }}>
        {txToSign ? (
          <>
            <h1>Transaction</h1>

            <p>Data: {txToSign?.data?.toString()}</p>
            <p>From: {txToSign?.from}</p>
            <p>To: {txToSign?.to}</p>
            <p>
              Gas Limit: {BigNumber.from(txToSign?.gasLimit ?? 0)?.toString()}
            </p>
            <p>Value: {utils.formatEther(txToSign?.value ?? 0)}</p>
            <p>Nonce: {txToSign?.nonce?.toString()}</p>
            <p>
              Estimated transaction cost:{' '}
              {utils.formatEther(calcEstimatedTxCost(txToSign))}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <button
                onClick={discardTx}
                className="font-bold py-2 px-4 rounded"
              >
                Discard
              </button>
              <button
                onClick={approveTx}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Approve
              </button>
            </div>
          </>
        ) : (
          <>Loading</>
        )}
      </div>
    </div>
  );
};

export default SendTransactionPage;
