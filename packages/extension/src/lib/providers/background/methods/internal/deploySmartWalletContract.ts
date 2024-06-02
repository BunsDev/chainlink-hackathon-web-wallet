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
import {
  getNextAccountId,
  UserAccount,
  UserSelectedAccount,
} from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { SmartWalletFactoryV1__factory } from '../../../../../typechain';
import { hash } from '../../../../utils/crypto';
import { SendTransactionRequestDTO } from '../external/eth_sendTransaction';
import { GetDeploySmartWalletContractTxDto } from './getDeploySmartWalletContractTx';

// TODO: move to shared constants
const factoryAddresses: Record<number, string> = {
  11155111: '0x74Fc48A59593e3E694E4821679e6BFA8dc8F934F',
};

export type DeployedContractResult = {
  address: string;
  txHash: string;
};

export const deploySmartWalletContract: BackgroundOnMessageCallback<
  DeployedContractResult,
  EthereumRequest<GetDeploySmartWalletContractTxDto>
> = async (req, domain) => {
  const [tx] = req.msg?.params!;

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const accounts = await storageWallets.get<UserAccount[]>('accounts');

  if (!accounts || !accounts.length) throw getCustomError('Accounts is null');

  const txHash = await sendMessageFromBackgroundToBackground<
    string,
    EthereumRequest<SendTransactionRequestDTO>
  >(
    {
      method: 'eth_sendTransaction',
      params: [{ ...tx, isContractWalletDeployment: true }],
    },
    RuntimePostMessagePayloadType.EXTERNAL,
    domain,
    true
  );

  const result: DeployedContractResult = {
    address: tx.address,
    txHash,
  };

  accounts.push({
    address: tx.address,
    isImported: false,
    masterAccount: tx.from,
    ...getNextAccountId(accounts, true),
  });

  await storageWallets.set('accounts', accounts);

  return result;
};
