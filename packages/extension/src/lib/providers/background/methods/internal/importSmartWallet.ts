import { getAddress } from 'ethers/lib/utils';
import Storage, { StorageNamespaces } from '../../../../storage';
import { UserAccount } from './initializeWallet';

export type ImportSmartWalletPayloadDTO = {
  address: string;
  masterWallet: string;
};

export const importSmartWallet = async ({
  address,
  masterWallet,
}: ImportSmartWalletPayloadDTO) => {
  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  // TODO: move selected account retrieving to helpers
  const selectedAccount = await storageWallets.get<UserAccount>(
    'selectedAccount'
  );

  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  if (!accounts || !selectedAccount) throw new Error('No accounts');

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
  });

  await storageWallets.set('accounts', accounts);

  console.log('QQQ', await storageWallets.get('accounts'));
};
