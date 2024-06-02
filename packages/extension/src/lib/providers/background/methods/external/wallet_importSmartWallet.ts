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
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { getActiveAccountForSite } from '../../helpers';
import { ImportSmartWalletPayloadDTO } from '../internal/importSmartWallet';
import { InternalBgMethods } from '../../../../message-handlers/background-message-handler';

export type ImportSmartWalletDto = string;

export const walletImportSmartWallet: BackgroundOnMessageCallback<
  void,
  EthereumRequest<ImportSmartWalletDto>
> = async (request, origin) => {
  const userSelectedAccount = await getActiveAccountForSite(origin);
  const { rpcProvider } = await getCurrentNetwork();

  if (!userSelectedAccount) {
    throw getCustomError('ethRequestAccounts: user selected address is null');
  }

  await sendMessageFromBackgroundToBackground<
    void,
    EthereumRequest<ImportSmartWalletPayloadDTO>
  >(
    {
      method: InternalBgMethods.IMPORT_SMART_WALLET,
      params: [
        {
          masterWallet: !!userSelectedAccount.masterAccount
            ? userSelectedAccount.masterAccount
            : userSelectedAccount.address,
          address: request?.msg?.params?.[0]!,
        },
      ],
    },
    RuntimePostMessagePayloadType.INTERNAL,
    origin,
    true
  );
};
