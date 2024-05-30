import { getAddress } from 'ethers/lib/utils';
import Browser from 'webextension-polyfill';
import { getCustomError } from '../../../../errors';
import {
  BackgroundOnMessageCallback,
  sendMessageToTab,
  sendRuntimeMessageToWindow,
} from '../../../../message-bridge/bridge';
import { PostMessageDestination } from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest, MessageMethod } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { sendAccountChangedToTab } from '../../helpers';

export type SwitchAccountsRequestPayloadDTO = {
  switchTo: string;
};

export const switchAccount: BackgroundOnMessageCallback<
  string,
  EthereumRequest<SwitchAccountsRequestPayloadDTO>
> = async (payload, _) => {
  if (!payload.msg || !payload.msg.params) {
    throw getCustomError('Invalid payload');
  }

  const [switchToAccount] = payload.msg.params;

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);
  const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS);

  // TODO: move keys to enum
  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  const selectedAccount = await storageWallets.get<UserSelectedAccount>(
    'selectedAccount'
  );
  const connectedDomains = await storageDomains.getAllKeys();

  if (!accounts || !accounts.length) {
    throw getCustomError('getUserAddresses: 0 accounts');
  }

  if (selectedAccount?.address === getAddress(switchToAccount.switchTo)) {
    throw getCustomError('Same account');
  }

  const accountToSwitch = accounts.find(
    (v) => getAddress(v.address) === getAddress(switchToAccount.switchTo)
  );

  if (!accountToSwitch) {
    throw getCustomError('Unknown account to switch');
  }

  await storageWallets.set<UserSelectedAccount>('selectedAccount', {
    ...accountToSwitch,
  });

  // TODO: move to helpers
  Promise.all(
    connectedDomains.map(async (domain) => {
      const connectedAccounts = (
        (await storageDomains.get<string[]>(domain)) ?? []
      ).map(getAddress);
      const addressToSwitch = getAddress(accountToSwitch.address);

      const shouldSwitch = connectedAccounts.includes(addressToSwitch);

      if (shouldSwitch) sendAccountChangedToTab(domain, addressToSwitch);
    })
  );

  return accountToSwitch.address;
};
