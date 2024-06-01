import { getAddress } from 'ethers/lib/utils';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getNextAccountId, UserAccount } from './initializeWallet';
import WindowPromise, {
  BackgroundOnMessageCallback,
} from '../../../../message-bridge/bridge';
import { EthereumRequest } from '../../../types';
import { getPopupPath, UIRoutes } from '../../../../popup-routes';

export type ImportSmartWalletPayloadDTO = {
  address: string;
  masterWallet: string;
};

export const importSmartWallet: BackgroundOnMessageCallback<
  void,
  EthereumRequest<ImportSmartWalletPayloadDTO>
> = async (request, _) => {
  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const [{ address, masterWallet }] = request.msg?.params!;
  const window = new WindowPromise();

  const accounts = await storageWallets.get<UserAccount[]>('accounts');
  if (!accounts) throw new Error('No accounts');

  const alreadyImported = !!accounts.find(
    (v) => getAddress(v.address) === getAddress(address)
  );

  if (alreadyImported) throw new Error('Already imported');

  const masterWalletExist = !!accounts.find(
    (v) => getAddress(v.address) === getAddress(masterWallet)
  );

  if (!masterWalletExist) throw new Error('Master wallet do not exist');

  if (request.triggerPopup) {
    const response = await window.getResponse<
      boolean,
      EthereumRequest<ImportSmartWalletPayloadDTO>
    >(
      getPopupPath(UIRoutes.ethSendTransaction.path),
      {
        method: request.msg!.method,
        params: request.msg?.params!,
      },
      true
    );

    if (response.error) throw response.error;
    if (!response.result) return;
  }

  accounts.push({
    address: getAddress(address),
    isImported: true,
    masterAccount: getAddress(masterWallet),
    ...getNextAccountId(accounts, true),
  });

  await storageWallets.set('accounts', accounts);
};
