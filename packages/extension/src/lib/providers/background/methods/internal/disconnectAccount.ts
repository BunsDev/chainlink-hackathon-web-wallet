import { getAddress } from 'ethers/lib/utils';
import Browser from 'webextension-polyfill';
import { getCustomError, getError } from '../../../../errors';
import WindowPromise, {
  BackgroundOnMessageCallback,
  sendRuntimeMessageToPopup,
} from '../../../../message-bridge/bridge';
import {
  RuntimeOnMessageResponse,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../../message-bridge/types';
import { getPopupPath, UIRoutes } from '../../../../popup-routes';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { ErrorCodes, EthereumRequest } from '../../../types';
import { sendAccountChangedToTab } from '../../helpers';
import { UserAccount, UserSelectedAccount } from '../internal/initializeWallet';

export const disconnectAccount: BackgroundOnMessageCallback<
  void,
  EthereumRequest<string>
> = async (req, d) => {
  const [currentTabUrl] = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const origin = currentTabUrl.url ?? '';

  const domain = getBaseUrl(origin);

  const [accountToDisconnect] = req.msg!.params!;

  const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS);

  if (!domain) {
    throw getCustomError('Invalid sender origin');
  }

  let connectedAddresses = await storageDomains.get<string[]>(domain);

  const addressArrayIndex = connectedAddresses
    ?.map(getAddress)
    ?.indexOf(getAddress(accountToDisconnect));

  if (addressArrayIndex === undefined || addressArrayIndex <= -1)
    throw getCustomError('Account is not connected');

  connectedAddresses?.splice(addressArrayIndex, 1);

  await storageDomains.set(domain, connectedAddresses);
};
