import { ContractFactory, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { Wallet, Wallet__factory } from '../../../../../typechain';
import { getCustomError } from '../../../../errors';
import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider';

export const getUndasContractDeployTx: BackgroundOnMessageCallback<
  TransactionRequest,
  EthereumRequest
> = async () => {
  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  // TODO: move selected account retrieving to helpers
  const selectedAccount = await storageWallets.get<UserSelectedAccount>(
    'selectedAccount'
  );

  if (!selectedAccount) throw new Error('Selected account is not set');

  const factory = new ContractFactory(
    Wallet__factory.abi,
    '0x608060' //Wallet__factory.bytecode,
  ) as Wallet__factory;

  const deployTx = factory.getDeployTransaction(selectedAccount.address);
  console.log('Deploy tx', deployTx);

  return deployTx;
};
