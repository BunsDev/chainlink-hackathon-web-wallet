import { getAddress } from 'ethers/lib/utils';
import { getCustomError } from '../../../../errors';
import WindowPromise, {
  BackgroundOnMessageCallback,
} from '../../../../message-bridge/bridge';
import Storage, { StorageNamespaces } from '../../../../storage';
import { decryptValue } from '../../../../utils/crypto';
import { EthereumRequestOverrideParams } from '../../../types';
import { UserAccount, UserSelectedAccount } from '../internal/initializeWallet';
import { getSessionPassword } from '../../../../storage/common';
import { Wallet } from 'ethers';
import { createWalletClient, http,  } from 'viem';
import { getPopupPath, UIRoutes } from '../../../../popup-routes';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { privateKeyToAccount } from 'viem/accounts';
import { getActiveAccountForSite } from '../../helpers';
export type SignTypedDataV4ParamsDto = any;

export type SignTypedDataV4Dto = [string, SignTypedDataV4ParamsDto];

export const ethSignTypedDataV4: BackgroundOnMessageCallback<
  unknown,
  EthereumRequestOverrideParams<SignTypedDataV4Dto>
> = async (request, domain) => {
  const payload = request.msg;

  if (!payload || !payload.params) {
    throw getCustomError('ethSignTypedDataV4: invalid data');
  }

  const [from, data] = request.msg?.params!;

  const storageAddresses = new Storage(StorageNamespaces.USER_WALLETS);
  const accounts = await storageAddresses.get<UserAccount[]>('accounts');

  const userSelectedAccount = await getActiveAccountForSite(domain);

  if (!userSelectedAccount) {
    throw getCustomError('ethRequestAccounts: user selected address is null');
  }

  const isSmartAccount = !!userSelectedAccount.masterAccount;

  const masterWalletAccount = isSmartAccount
    ? accounts?.find(
        (v) =>
          getAddress(v.address) ===
          getAddress(userSelectedAccount.masterAccount!)
      )
    : null;

  if (masterWalletAccount === undefined) {
    throw new Error('Master account is not found');
  }
  const password = await getSessionPassword();

  if (!password) {
    throw new Error('Wallet is locked');
  }

  const window = new WindowPromise();

  const response =
    // TODO: return only updated gas fees
    await window.getResponse<
      boolean,
      EthereumRequestOverrideParams<SignTypedDataV4Dto>
    >(
      getPopupPath(UIRoutes.ethSignTypedData.path),
      {
        method: payload.method,
        params: request.msg?.params!,
      },
      true
    );

  if (response.error) throw response.error;
  if (!response.result) throw new Error('Ui rejected sign data');

  const decryptedPk = decryptValue(
    isSmartAccount
      ? masterWalletAccount!.privateKey!
      : userSelectedAccount.privateKey!,
    password
  );
  const { jsonRpcUrl } = await getCurrentNetwork();

  const client = createWalletClient({
    account: '0x',
    transport: http(jsonRpcUrl),
  });

  const account = privateKeyToAccount(decryptedPk as '0x');

  const signedData = await account.signTypedData({
    account: getAddress(from),
    ...JSON.parse(data),
  });

  return signedData;
};
