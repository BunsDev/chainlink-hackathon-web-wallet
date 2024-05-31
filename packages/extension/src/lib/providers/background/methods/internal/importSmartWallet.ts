import { getAddress } from 'ethers/lib/utils';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getNextAccountId, UserAccount } from './initializeWallet';
import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import { EthereumRequest } from '../../../types';

export type ImportSmartWalletPayloadDTO = {
  address: string;
  masterWallet: string;
};

export const importSmartWallet: BackgroundOnMessageCallback<
  void,
  EthereumRequest<ImportSmartWalletPayloadDTO>
> = async (payload, _) => {
  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const [{ address, masterWallet }] = payload.msg?.params!;
  
  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  if (!accounts) throw new Error('No accounts');

  const alreadyImported = !!accounts.find(
    (v) => getAddress(v.address) === getAddress(address)
  );

  if (alreadyImported) throw new Error('Already imported');

  const masterWalletExist = !!accounts.find(
    (v) => getAddress(v.address) === getAddress(masterWallet)
  );

  if (masterWalletExist) throw new Error('Master wallet do not exist');

  accounts.push({
    address: getAddress(address),
    isImported: true,
    masterAccount: getAddress(masterWallet),
    ...getNextAccountId(accounts, true),
  });

  await storageWallets.set('accounts', accounts);
};
