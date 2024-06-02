import { formatUnits, getAddress } from 'ethers/lib/utils';
import { getCustomError } from '../../../../errors';
import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';

export type GetAccountsDTO = {
  address: string;
  isConnected: boolean;
  isImported: boolean;
  isActive: boolean;
  balanceNative: string;
  isSmartContract: boolean;
  masterWallet?: string;
  name: string;
  id: number;
};

export const getUserAddresses: BackgroundOnMessageCallback<
  GetAccountsDTO[],
  EthereumRequest<string>
> = async (payload, _) => {
  if (!payload.msg || !payload.msg.params) {
    throw getCustomError('Invalid payload');
  }

  const [url] = payload.msg.params;

  const domain = getBaseUrl(url);

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);
  const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS);

  // TODO: move keys to enum
  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  const selectedAccount = await storageWallets.get<UserSelectedAccount>(
    'selectedAccount'
  );
  const connectedAccounts = await storageDomains.get<string[]>(domain);

  if (!accounts || !accounts.length) {
    throw getCustomError('getUserAddresses: 0 accounts');
  }

  const network = await getCurrentNetwork();

  return await Promise.all(
    accounts
      .map((acc) => async () => {
        const isSelected = selectedAccount
          ? getAddress(acc.address) === getAddress(selectedAccount.address)
          : false;

        const balance = await network.rpcProvider.getBalance(acc.address);

        return {
          address: acc.address,
          isActive: isSelected,
          name: acc.name,
          id: acc.id,
          isImported: acc.isImported,
          isConnected: connectedAccounts
            ? connectedAccounts
                .map(getAddress)
                .includes(getAddress(acc.address))
            : false,
          balanceNative: formatUnits(balance, 18),
          isSmartContract: !!acc.masterAccount,
          masterWallet: acc.masterAccount,
        } as GetAccountsDTO;
      })
      .map((v) => v())
  );
};
