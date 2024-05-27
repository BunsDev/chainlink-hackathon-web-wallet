import Storage, { StorageNamespaces } from '../../../../storage';
import { UserAccount } from './initializeWallet';


export const importContract = async (contractAddress:string) => {

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  // TODO: move selected account retrieving to helpers
  const selectedAccount = await storageWallets.get<UserAccount>(
    'selectedAccount'
  );
  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  if(!accounts || !selectedAccount) return console.log('!accounts');

  accounts.map((address: any) => {
    if (address.address == selectedAccount.address) {
      address.undasContract = contractAddress;
    }
  });

  await storageWallets.set('selectedAccount', selectedAccount);
  await storageWallets.set('accounts', accounts);
  console.log('QQQ', await storageWallets.get('accounts'))

};
