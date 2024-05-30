import {
  BigNumber,
  BigNumberish,
  ethers,
  Transaction,
  UnsignedTransaction,
  Wallet,
} from 'ethers';
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
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { SmartWalletV1__factory } from '../../../../../typechain';
import { decryptValue } from '../../../../utils/crypto';
import { getSessionPassword } from '../../../../storage/common';
import { getAddress } from 'ethers/lib/utils';

const bnToHex = (value?: BigNumberish) => {
  return value ? BigNumber.from(value).toHexString() : undefined;
};

export type SendTransactionRequestDTO = TransactionRequest & {
  useMasterAccountValue?: boolean;
};

export const ethSendTransaction: BackgroundOnMessageCallback<
  unknown,
  EthereumRequest<SendTransactionRequestDTO>
> = async (request, origin) => {
  console.log('ethRequestAccounts', request);
  const payload = request.msg;
  const domain = getBaseUrl(origin);

  if (!payload || !payload.params || !payload.params.length) {
    throw getCustomError('ethSendTransaction: invalid data');
  }

  const [txRequest] = payload.params;

  console.log('Origin TxRequest', txRequest);

  // const txRequest =   ethers.utils.parseTransaction(txRequestRaw) as TransactionRequest;

  console.log({ txRequest });
  const window = new WindowPromise();

  const storageAddresses = new Storage(StorageNamespaces.USER_WALLETS);

  if (!domain) {
    throw getCustomError('ethRequestAccounts: invalid sender origin');
  }

  const accounts = await storageAddresses.get<UserAccount[]>('accounts');

  const userSelectedAccount = await storageAddresses.get<UserSelectedAccount>(
    'selectedAccount'
  );

  if (!userSelectedAccount) {
    throw getCustomError('ethRequestAccounts: user selected address is null');
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
    const walletContract = SmartWalletV1__factory.connect(
      userSelectedAccount.address,
      rpcProvider
    );

    if (!txRequest.to) throw getCustomError('missing argument');

    console.log('tx.to', txRequest.to);
    console.log('tx.datatx.data', txRequest.data);

    const populatedTx = await walletContract.populateTransaction.execute(
      txRequest.to,
      txRequest.value ?? '0',
      txRequest.data ?? '0x'
    );

    console.log('populatedTx', populatedTx);

    txRequest.data = populatedTx.data ?? '0x';
    txRequest.to = populatedTx.to;
  }

  if (!txRequest.nonce) {
    txRequest.nonce = await rpcProvider.getTransactionCount(senderAddress);
  }

  if (!txRequest.gasPrice) {
    const estimatedGasPrice = await rpcProvider.getFeeData();

    txRequest.gasPrice = estimatedGasPrice.gasPrice ?? undefined;
  }

  if (!txRequest.gasLimit) {
    const estimatedGas = await rpcProvider
      .estimateGas(txRequest as any)
      .catch((err) => {
        console.error('estimate gas err', err);
        return BigNumber.from(1_000_000);
      });
    txRequest.gasLimit =
      // (txRequest as any).gas?.toString() ??
      estimatedGas;
  }

  let tx = txRequest;

  console.log('tx.data', tx.data);
  console.log('isSmartAccount', isSmartAccount);
  console.log('request.triggerPopup', request.triggerPopup);

  if (request.triggerPopup) {
    // TODO: pass flag to trigger/not-trigger popup menu
    // to be able to use this bg handler for internal purposes
    const response =
      // TODO: return only updated gas fees
      await window.getResponse<SendTransactionRequestDTO>(
        getPopupPath(UIRoutes.ethSendTransaction.path),
        {
          method: payload.method,
          params: [
            {
              ...tx,
              isSmartAccount,
              masterWallet: userSelectedAccount.masterAccount,
            },
          ],
        },
        true
      );

    if (response.error) throw response.error;
    tx = response.result ?? tx;
    console.log('trueTX', tx);
  }

  if (isSmartAccount && !txRequest.useMasterAccountValue) delete tx.value;

  delete (tx as any).gas;

  delete tx.maxFeePerGas;
  delete tx.maxPriorityFeePerGas;

  console.log('default tx', tx);

  const password = await getSessionPassword();
  
  if(!password) {
    throw new Error('Wallet is locked');
  }

  const decryptedPk = decryptValue(
    isSmartAccount
      ? masterWalletAccount!.privateKey!
      : userSelectedAccount.privateKey!,
    password
  );

  const wallet = new Wallet(decryptedPk);

  const signedTx = await wallet.signTransaction({
    data: tx.data,
    from: tx.from,
    nonce: tx.nonce,
    chainId: tx.chainId,
    to: tx.to,
    gasLimit: bnToHex(tx.gasLimit),
    gasPrice: bnToHex(tx.gasPrice),
    // FIXME
    // maxFeePerGas: bnToHex(tx.maxFeePerGas),
    // maxPriorityFeePerGas: bnToHex(tx.maxPriorityFeePerGas),
    value: bnToHex(tx.value),
  });

  console.log('signedTx', signedTx);

  (payload.params as any[])[0] = signedTx;

  return sendMessageFromBackgroundToBackground<any, EthereumRequest<string>>(
    {
      method: 'eth_sendRawTransaction',
      params: [signedTx],
    },
    RuntimePostMessagePayloadType.EXTERNAL,
    origin
  );
};
