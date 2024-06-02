import { getCustomError } from '../../../../errors';
import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import { RuntimePostMessagePayload } from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import {
  getSessionPassword,
  setSessionPassword,
} from '../../../../storage/common';
import { getDeriveAccount } from '../../../../utils/accounts';
import { encryptValue, hash } from '../../../../utils/crypto';
import { EthereumRequest } from '../../../types';

export type InitializeWalletPayloadDTO = {
  mnemonic: string;
  walletPassword: string;
};

export type UserAccount = {
  address: string;
  // if exist - its a smart wallet
  masterAccount?: string;
  mnemonicDeriveIndex?: number;
  privateKey?: string;
  name: string;
  id: number;
  isImported: boolean;
};

export type UserSelectedAccount = UserAccount;

export const getNextAccountId = (
  accounts: UserAccount[],
  smartWallet: boolean
) => {
  const id = accounts.filter((v) =>
    smartWallet ? !!v.masterAccount : !v.masterAccount
  ).length;

  return {
    id,
    name: smartWallet ? `Smart account ${id + 1}` : `Account ${id + 1}`,
  };
};

export const initializeWallet: BackgroundOnMessageCallback<
  string,
  EthereumRequest
> = async (request, domain) => {
  const msg = request.msg;

  if (!msg || !msg.params?.length) throw getCustomError('Invalid payload');

  const payload = msg.params[0] as InitializeWalletPayloadDTO;

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);
  const commonStorage = new Storage(StorageNamespaces.COMMON);

  if (await storageWallets.get('mnemonic'))
    throw getCustomError('Already initialized');

  await storageWallets.set(
    'mnemonic',
    encryptValue(payload.mnemonic, payload.walletPassword)
  );

  await setSessionPassword(payload.walletPassword);

  const account = getDeriveAccount(payload.mnemonic, 0);

  const storageAccount = {
    address: account.address,
    mnemonicDeriveIndex: 0,
    privateKey: encryptValue(account.privateKey, payload.walletPassword),
    isImported: false,
    ...getNextAccountId([], false),
  } as UserAccount;

  const selectedAccount = {
    ...storageAccount,
  } as UserSelectedAccount;

  await commonStorage.set('passwordHash', hash(payload.walletPassword));
  await storageWallets.set('accounts', [storageAccount]);
  await storageWallets.set('selectedAccount', selectedAccount);

  return account.address;
};
