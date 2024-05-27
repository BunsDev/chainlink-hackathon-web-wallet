import { getCustomError } from "../../../../errors";
import { BackgroundOnMessageCallback } from "../../../../message-bridge/bridge";
import { RuntimePostMessagePayload } from "../../../../message-bridge/types";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getSessionPassword, setSessionPassword } from "../../../../storage/common";
import { getDeriveAccount } from "../../../../utils/accounts";
import { encryptValue, hash } from "../../../../utils/crypto";
import { EthereumRequest } from "../../../types";

export type InitializeWalletPayloadDTO = {
    mnemonic: string;
    walletPassword: string
}

export type UserAccount = {
    address: string,
    mnemonicDeriveIndex?: number,
    isImported: boolean
    privateKey?: string,
    undasContract: string
}

export type UserSelectedAccount = {
    isUndasContractSelected: boolean
} & UserAccount

export const initializeWallet: BackgroundOnMessageCallback<string, EthereumRequest> = async (
    request,
    domain
) => {
    const msg = request.msg;

    if (!msg || !msg.params?.length) throw getCustomError('Invalid payload');

    const payload = msg.params[0] as InitializeWalletPayloadDTO;

    console.log('initializePayload', payload);

    const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);
    const commonStorage = new Storage(StorageNamespaces.COMMON);

    console.log('mnemonic: ', payload.mnemonic);

    if (await storageWallets.get('mnemonic'))
        throw getCustomError('Already initialized');

    await storageWallets.set(
      'mnemonic',
      encryptValue(payload.mnemonic, payload.walletPassword)
    );

    await setSessionPassword(payload.walletPassword);

    const account = getDeriveAccount(payload.mnemonic, 0);

    const storageAccount = {
      address: account.address,
      mnemonicDeriveIndex: 0,
      privateKey: encryptValue(account.privateKey, payload.walletPassword),
      isImported: false,
    } as UserAccount;

    const selectedAccount = {
        ...storageAccount,
        isUndasContractSelected: false
    } as UserSelectedAccount

    await commonStorage.set('passwordHash', hash(payload.walletPassword));
    await storageWallets.set('accounts', [storageAccount]);
    await storageWallets.set('selectedAccount', selectedAccount);

    return account.address;
}