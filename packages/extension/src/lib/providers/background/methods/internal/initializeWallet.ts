import { getCustomError } from "../../../../errors";
import { BackgroundOnMessageCallback } from "../../../../message-bridge/bridge";
import { RuntimePostMessagePayload } from "../../../../message-bridge/types";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getDeriveAccount } from "../../../../utils/accounts";
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

    console.log('mnemonic: ', payload.mnemonic);

    if (await storageWallets.get('mnemonic'))
        throw getCustomError('Already initialized');

    // TODO: validate mnemonic
    await storageWallets.set('mnemonic', payload.mnemonic);

    const account = getDeriveAccount(payload.mnemonic, 0);

    const storageAccount = {
        address: account.address,
        mnemonicDeriveIndex: 0,
        privateKey: account.privateKey,
        isImported: false
    } as UserAccount

    const selectedAccount = {
        ...storageAccount,
        isUndasContractSelected: false
    } as UserSelectedAccount

    // TODO: encode pk with wallet password
    await storageWallets.set('accounts', [storageAccount]);

    await storageWallets.set('selectedAccount', selectedAccount);

    return account.address;
}