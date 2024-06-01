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
import {
  getCurrentNetwork,
  getNetwork,
  getSupportedNetworks,
} from '../../../../requests/toRpcNode';
import { GetCurrentNetworkDTO } from './getCurrentNetwork';

export const getAllNetworks: BackgroundOnMessageCallback<
  GetCurrentNetworkDTO[],
  EthereumRequest
> = async (payload, _) => {
  if (!payload.msg || !payload.msg.params) {
    throw getCustomError('Invalid payload');
  }

  const networks = getSupportedNetworks();
  const selectedNetwork = await getCurrentNetwork();

  return networks.map((network) => ({
    chainId: network.chainId,
    name: network.name,
    nativeName: network.nativeName,
    nativeSymbol: network.nativeSymbol,
    image: network.image,
    isActive: network.name === selectedNetwork.name,
  }));
};
