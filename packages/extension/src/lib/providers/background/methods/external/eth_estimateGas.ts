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
import {
  getCurrentNetwork,
  makeRpcRequest,
} from '../../../../requests/toRpcNode';
import { getActiveAccountForSite } from '../../helpers';
import { getAddress } from 'ethers/lib/utils';
import { SmartWalletV1__factory } from '../../../../../typechain';

export const ethEstimateGas: BackgroundOnMessageCallback<
  unknown,
  EthereumRequest<TransactionRequest>
> = async (request, origin) => {
  const payload = request.msg;
  const domain = getBaseUrl(origin);

  if (!payload || !payload.params || !payload.params.length) {
    throw getCustomError('ethSendTransaction: invalid data');
  }
  const storageAddresses = new Storage(StorageNamespaces.USER_WALLETS);

  const [txRequest] = payload.params;

  if (!domain) {
    throw getCustomError('ethRequestAccounts: invalid sender origin');
  }
  const accounts = await storageAddresses.get<UserAccount[]>('accounts');

  const userSelectedAccount = await getActiveAccountForSite(domain);

  if (!userSelectedAccount) {
    throw getCustomError('Account is not connected');
  }

  const { rpcProvider } = await getCurrentNetwork();

  const isSmartAccount = !!userSelectedAccount.masterAccount;

  const masterWalletAccount = isSmartAccount
    ? accounts?.find(
        (v) => getAddress(v.address) === userSelectedAccount.address
      )
    : null;

  if (masterWalletAccount === undefined) {
    throw new Error('Master account is not found');
  }

  const senderAddress = isSmartAccount
    ? userSelectedAccount.masterAccount!
    : userSelectedAccount.address;

  txRequest.from ??= senderAddress;

  if (isSmartAccount) {
    txRequest.from = userSelectedAccount.masterAccount!;

    if (!txRequest.to) throw getCustomError('missing argument');

    if (getAddress(txRequest.to) !== getAddress(userSelectedAccount.address)) {
      const walletContract = SmartWalletV1__factory.connect(
        userSelectedAccount.address,
        rpcProvider
      );

      const populatedTx = await walletContract.populateTransaction.execute(
        txRequest.to,
        txRequest.value ?? '0',
        txRequest.data ?? '0x'
      );

      txRequest.data = populatedTx.data ?? '0x';
      txRequest.to = populatedTx.to;
      delete txRequest.value;
    }
  }

  // if (!txRequest.nonce) {
  //     txRequest.nonce = await rpcProvider.getTransactionCount(userSelectedAccount.address)
  // }

  // // if (!txRequest.gasPrice) {
  // //     const estimatedGasPrice = await rpcProvider.getFeeData();

  // //     txRequest.gasPrice = estimatedGasPrice.gasPrice?.toHexString() ?? undefined;
  // // }

  // if (!txRequest.gasLimit) {
  //     const estimatedGas = await rpcProvider.estimateGas(txRequest).catch(err => {console.error(err); return BigNumber.from(1_000_000)});
  //     txRequest.gasLimit =
  //         // (txRequest as any).gas?.toString() ??
  //         estimatedGas.toHexString();
  // }

  // delete (txRequest as any).gas;

  payload.params[0] = txRequest;

  return makeRpcRequest(request, origin);
};
