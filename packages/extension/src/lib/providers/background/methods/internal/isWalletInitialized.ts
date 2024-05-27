import { getCustomError } from "../../../../errors";
import { BackgroundOnMessageCallback } from "../../../../message-bridge/bridge";
import { RuntimePostMessagePayload } from "../../../../message-bridge/types";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getDeriveAccount } from "../../../../utils/accounts";
import { EthereumRequest } from "../../../types";

export const isWalletInitialized: BackgroundOnMessageCallback<boolean, EthereumRequest> = async () => {
    const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

    // TODO: move storage keys to enums
    const mnemonic = await storageWallets.get('mnemonic')
    if (mnemonic) {
        return true;
    } else {
        return false;
    }
}