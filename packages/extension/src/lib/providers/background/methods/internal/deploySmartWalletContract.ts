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
import { SendTransactionRequestDTO } from '../external/eth_sendTransaction';

// TODO: move to shared constants
const factoryAddresses: Record<number, string> = {
  11155111: '0xAb6Cb2842DEfDEfA0978cD1e65D59DBfbd8518F2',
};

export type DeployedContractResult = {
  address: string;
  txHash: string;
};

export const deploySmartWalletContract: BackgroundOnMessageCallback<
  DeployedContractResult,
  EthereumRequest
> = async (req, domain) => {
  console.log('deploySmartWalletContract');

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

  const txHash = await sendMessageFromBackgroundToBackground<
    string,
    EthereumRequest<SendTransactionRequestDTO>
  >(
    {
      method: 'eth_sendTransaction',
      params: [{ ...deployTx, isContractWalletDeployment: true }],
    },
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
    address: deploymentAddress,
    isImported: false,
    masterAccount: selectedAccount.address,
  });

  await storageWallets.set('accounts', accounts);

  return result;
};
