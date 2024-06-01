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
import {
  sendAccountChangedToTab,
  sendNetworkChangedToTab,
} from '../../helpers';
import { getCurrentNetwork, getNetwork } from '../../../../requests/toRpcNode';

export type SwitchNetworkRequestPayloadDTO = {
  switchTo: string;
};

export const switchNetwork: BackgroundOnMessageCallback<
  void,
  EthereumRequest<SwitchNetworkRequestPayloadDTO>
> = async (payload, _) => {
  if (!payload.msg || !payload.msg.params) {
    throw getCustomError('Invalid payload');
  }

  const [switchToNetwork] = payload.msg.params;

  const storageCommon = new Storage(StorageNamespaces.COMMON);

  const network = await getCurrentNetwork();
  const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS);

  if (switchToNetwork.switchTo === network.name) {
    throw new Error('Same network');
  }
  const newNetwork = getNetwork(switchToNetwork.switchTo);

  if (!newNetwork) {
    throw new Error('Unknown network');
  }
  await storageCommon.set('selectedNetwork', newNetwork.name);

  await Promise.all(
    (
      await storageDomains.getAllKeys()
    ).map(async (domain) => {
      await sendNetworkChangedToTab(domain, newNetwork.chainId);
    })
  );
};
