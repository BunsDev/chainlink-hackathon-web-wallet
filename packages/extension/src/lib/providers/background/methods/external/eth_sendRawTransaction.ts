import { BigNumber, ethers, UnsignedTransaction, Wallet } from 'ethers';
import { getCustomError } from '../../../../errors';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import WindowPromise, {
  BackgroundOnMessageCallback,
  sendMessageFromBackgroundToBackground,
  sendRuntimeMessageToPopup,
} from '../../../../message-bridge/bridge';
import {
  RuntimeOnMessageResponse,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../../message-bridge/types';
import { getPopupPath, UIRoutes } from '../../../../popup-routes';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from '../internal/initializeWallet';
import { getCurrentNetwork, getNetwork } from '../../../../requests/toRpcNode';

export const ethSendRawTransaction: BackgroundOnMessageCallback<
  unknown,
  EthereumRequest<string>
> = async (request, origin) => {
  console.log('ethSendRawTransaction');
  const payload = request.msg;
  const domain = getBaseUrl(origin);

  if (!payload || !payload.params || payload.params.length !== 1) {
    throw getCustomError('ethSendRawTransaction: invalid data');
  }

  const [signedTx] = payload.params;

  const { rpcProvider, name } = await getCurrentNetwork();
  const txResponse = await rpcProvider.sendTransaction(signedTx);

  const txParsed = ethers.utils.parseTransaction(signedTx);

  const storageTxHistory = new Storage(
    StorageNamespaces.USER_TRANSACTIONS_HISTORY
  );

  // TODO: move out
  const getHistory = async () => {
    return (
      (await storageTxHistory.get<
        {
          id: string;
          confirmed: boolean;
          status?: 'failed' | 'successful' | 'dropped';
        }[]
      >(txParsed.from!)) ?? []
    );
  };

  const userHistory = await getHistory();
  userHistory.push({ id: txResponse.hash, confirmed: false });

  const waitForTx = async () => {
    const interval = setInterval(
      async () => {
        console.log('check tx status interval');
        const tx = await rpcProvider.getTransaction(txParsed.hash!);
        const txReceipt = await rpcProvider.getTransactionReceipt(
          txParsed.hash!
        );
        const userHistory = await getHistory();

        const sendNotification = () => {
          chrome.notifications.create(
            `TX|${txResponse.hash}|${name}`,
            {
              iconUrl: 'https://proxy-rent.netlify.app/favicon.ico',
              message:
                txRecord.status === 'dropped'
                  ? ':('
                  : `Transaction ${txParsed.hash!} was confirmed with status ${
                      txRecord.status
                    }`,
              title: `Transaction is ${
                txRecord.status === 'dropped' ? 'dropped' : 'confirmed'
              }`,
              type: 'basic',
            },
            function () {
              console.log('created!');
            }
          );
        };

        const save = async () => {
          await storageTxHistory.set(txParsed.from!, userHistory);
        };

        const txRecord = userHistory.find((v) => v.id === txParsed.hash!)!;
        if (tx && txReceipt) {
          // tx was mined
          clearInterval(interval);
          txRecord.confirmed = true;
          txRecord.status = txReceipt.status === 0 ? 'failed' : 'successful';
          sendNotification();
          await save();
        } else if (!tx && !txReceipt) {
          // tx wasnt mined and is not in a mempool
          clearInterval(interval);
          txRecord.confirmed = true;
          txRecord.status = 'dropped';
          sendNotification();
          await save();
        } else {
          // tx is in mempool and wasnt yet confirmed or dropped
        }
      },
      // TODO: move to current network config constants
      10_000
    );
  };

  await storageTxHistory.set(txParsed.from!, userHistory);
  waitForTx();

  return txResponse.hash;
};
