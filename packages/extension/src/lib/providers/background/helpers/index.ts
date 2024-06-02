import { assert } from 'chai';
import { getAddress } from 'ethers/lib/utils';
import Browser from 'webextension-polyfill';
import { sendMessageToTab } from '../../../message-bridge/bridge';
import { PostMessageDestination } from '../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../storage';
import { getBaseUrl } from '../../../utils/url';
import { EthereumRequest, MessageMethod } from '../../types';
import {
  UserAccount,
  UserSelectedAccount,
} from '../methods/internal/initializeWallet';

export const sendAccountChangedToTab = async (
  tabDomain: string,
  switchTo: string | undefined | null
) => {
  const tabs = ((await Browser.tabs.query({})) ?? []).filter(
    (v) => getBaseUrl(v.url ?? '') === tabDomain
  );

  tabs.forEach((tab) => {
    if (!tab || !tab.id) return;

    let req = !!switchTo
      ? {
          method: MessageMethod.changeAddress,
          params: [switchTo],
        }
      : {
          method: MessageMethod.changeConnected,
          params: [false, 4900],
        };

    sendMessageToTab<EthereumRequest>(
      tab.id,
      PostMessageDestination.WINDOW,
      req
    );
  });
};

export const sendNetworkChangedToTab = async (
  tabDomain: string,
  switchToNetworkChainId: number
) => {
  const tabs = ((await Browser.tabs.query({})) ?? []).filter(
    (v) => getBaseUrl(v.url ?? '') === tabDomain
  );

  tabs.forEach((tab) => {
    if (!tab || !tab.id) return;

    sendMessageToTab<EthereumRequest>(tab.id, PostMessageDestination.WINDOW, {
      method: MessageMethod.changeChainId,
      params: [switchToNetworkChainId.toString(16)],
    });
  });
};

export const getActiveAccountForSite = async (
  domain: string,
  connectedDomainsStorage: Storage = new Storage(
    StorageNamespaces.CONNECTED_DOMAINS
  ),
  accountsStorage: Storage = new Storage(StorageNamespaces.USER_WALLETS)
): Promise<UserSelectedAccount | undefined> => {
  const connectedAddresses =
    (await connectedDomainsStorage.get<string[]>(domain))?.map((v) =>
      getAddress(v)
    ) ?? [];

  const userAccounts = await accountsStorage.get<UserAccount[]>('accounts');

  const selected = userAccounts?.find((v) =>
    connectedAddresses?.includes(getAddress(v.address))
  );

  const selectedAccount = await new Storage(
    StorageNamespaces.USER_WALLETS
  ).get<UserSelectedAccount>('selectedAccount');

  return selectedAccount ?? undefined;
};
