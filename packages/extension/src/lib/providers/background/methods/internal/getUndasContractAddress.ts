import Storage, { StorageNamespaces } from '../../../../storage';
import { UserAccount } from './initializeWallet';


export const getUndasContractAddress = async () => {

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  // TODO: move selected account retrieving to helpers
  const selectedAccount = await storageWallets.get<UserAccount>(
    'selectedAccount'
  );


  return selectedAccount?.undasContract;
};
