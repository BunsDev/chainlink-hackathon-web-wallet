import { getAddress } from 'ethers/lib/utils';
import { getCustomError, getError } from '../../../../errors';
import WindowPromise, {
  BackgroundOnMessageCallback,
  sendMessageFromBackgroundToBackground,
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
import { UserAccount, UserSelectedAccount } from '../internal/initializeWallet';

export type RequestWalletAccountsResponseDTO = {
  address: string;
  isSmartWallet: boolean;
  swartWalletVersion: 'v1';
}[];

export const walletRequestAccounts: BackgroundOnMessageCallback<
  RequestWalletAccountsResponseDTO,
  EthereumRequest
> = async (request, origin) => {
  const storageAddresses = new Storage(StorageNamespaces.USER_WALLETS);
  const accounts = await storageAddresses.get<UserAccount[]>('accounts');

  const connectedAccountAddresses = (
    await sendMessageFromBackgroundToBackground<string[]>(
      {
        method: 'eth_requestAccounts',
        params: [],
      } as EthereumRequest,
      RuntimePostMessagePayloadType.EXTERNAL,
      origin,
      true
    )
  ).map((v) => getAddress(v));

  const connectedAccounts =
    accounts?.filter((v) =>
      connectedAccountAddresses.includes(getAddress(v.address))
    ) ?? [];

  if (connectedAccounts.length !== connectedAccountAddresses.length) {
    throw new Error('Connected accounts mismatch');
  }

  return connectedAccounts.map((v) => ({
    address: getAddress(v.address),
    isSmartWallet: !v.masterAccount,
    swartWalletVersion: 'v1',
  }));
};
