import { ContractFactory, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { TestGameContract__factory } from '../../../../../Popup/testContractFactory/TestGameContract__factory';
import { Wallet__factory } from '../../../../../Popup/testContractFactory/Wallet__factory';
import { getCustomError } from '../../../../errors';
import {
  BackgroundOnMessageCallback,
  sendMessageFromBackgroundToBackground,
} from '../../../../message-bridge/bridge';
import {
  PostMessageDestination,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { SmartWalletFactoryV1__factory } from '../../../../../typechain';
import { hash } from '../../../../utils/crypto';

// TODO: move to shared constants
const factoryAddresses: Record<number, string> = {
  11155111: '0x',
};

export type DeployedContractResult = {
  address: string;
  txHash: string;
};

export const deploySmartWalletContract: BackgroundOnMessageCallback<
  DeployedContractResult,
  EthereumRequest<TransactionRequest>
> = async (req, domain) => {
  console.log('deploySmartWalletContract');

  // TODO: move invalid payload error to predefined errors
  if (!req.msg || !req.msg.params || !req.msg.params.length)
    throw getCustomError('Invalid payload');

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const selectedAccount = await storageWallets.get<UserSelectedAccount>(
    'selectedAccount'
  );

  if (!selectedAccount) throw getCustomError('Selected addresses is null');

  const accounts = await storageWallets.get<UserAccount[]>('accounts');

  if (!accounts || !accounts.length) throw getCustomError('Accounts is null');

  const { rpcProvider, chainId } = await getCurrentNetwork();

  const factoryAddress = factoryAddresses[chainId];

  if (!factoryAddress) {
    throw new Error('Network is not supported');
  }

  const factory = SmartWalletFactoryV1__factory.connect(
    factoryAddress,
    rpcProvider
  );

  const randomSeed = hash(new Date().getTime().toString());

  const salt = ethers.utils.solidityKeccak256(
    ['address', 'string'],
    [selectedAccount.address, randomSeed]
  );

  const deployTx = await factory.populateTransaction.create2Wallet(
    selectedAccount.address,
    selectedAccount.address,
    salt
  );

  const deploymentAddress = await factory.predictCreate2Wallet(
    selectedAccount.address,
    salt
  );

  const nonce =
    deployTx.nonce ??
    (await rpcProvider.getTransactionCount(
      selectedAccount.address ?? '',
      'pending'
    ));

  console.log({ nonce });

  console.log('Anticipated address', deploymentAddress);
  console.log('Tx request', deployTx);

  const txHash = await sendMessageFromBackgroundToBackground<string>(
    {
      method: 'eth_sendTransaction',
      params: [deployTx],
    } as EthereumRequest<TransactionRequest>,
    RuntimePostMessagePayloadType.EXTERNAL,
    domain,
    true
  );

  const result: DeployedContractResult = {
    address: deploymentAddress,
    txHash,
  };

  console.log('DEPLOY CONTRACT RESULT:', result);

  accounts.push({
    address: factoryAddress,
    isImported: false,
    masterAccount: selectedAccount.address,
  });

  await storageWallets.set('accounts', accounts);

  return result;
};
