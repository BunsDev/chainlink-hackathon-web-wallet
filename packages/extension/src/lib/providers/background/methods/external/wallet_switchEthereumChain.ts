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
import {
  getCurrentNetwork,
  getNetwork,
  getNetworkByChainId,
} from '../../../../requests/toRpcNode';
import { getActiveAccountForSite } from '../../helpers';
import { ImportSmartWalletPayloadDTO } from '../internal/importSmartWallet';
import { InternalBgMethods } from '../../../../message-handlers/background-message-handler';
import { SwitchNetworkRequestPayloadDTO } from '../internal/switchNetwork';

export type SwitchNetworkDto = {
  chainId: string;
};

export type SwitchNetworkUiDto = Exclude<
  ReturnType<typeof getNetworkByChainId>,
  undefined
>;

export const walletSwitchEthereumChain: BackgroundOnMessageCallback<
  void,
  EthereumRequest<SwitchNetworkDto>
> = async (request, origin) => {
  const userSelectedAccount = await getActiveAccountForSite(origin);

  if (!userSelectedAccount) {
    throw getCustomError('ethRequestAccounts: user selected address is null');
  }

  const newNetwork = getNetworkByChainId(request.msg?.params?.[0].chainId!);

  if (!newNetwork) throw getCustomError('Network is not supported');

  if (request.triggerPopup) {
    const window = new WindowPromise();
    const response = await window.getResponse<
      boolean,
      EthereumRequest<SwitchNetworkUiDto>
    >(
      getPopupPath(UIRoutes.ethSwitchChain.path),
      {
        method: request.msg!.method,
        params: [newNetwork],
      },
      true
    );

    if (response.error) throw response.error;
    if (!response.result) return;
  }

  await sendMessageFromBackgroundToBackground<
    void,
    EthereumRequest<SwitchNetworkRequestPayloadDTO>
  >(
    {
      method: InternalBgMethods.SWITCH_NETWORK,
      params: [
        {
          switchTo: newNetwork?.name!,
        },
      ],
    },
    RuntimePostMessagePayloadType.INTERNAL,
    origin,
    true
  );
};
