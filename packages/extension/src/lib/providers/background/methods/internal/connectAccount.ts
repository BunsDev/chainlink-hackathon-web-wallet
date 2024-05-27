import { getAddress } from "ethers/lib/utils";
import Browser from "webextension-polyfill";
import { getCustomError, getError } from "../../../../errors";
import WindowPromise, { BackgroundOnMessageCallback, sendRuntimeMessageToPopup } from "../../../../message-bridge/bridge";
import { RuntimeOnMessageResponse, RuntimePostMessagePayload, RuntimePostMessagePayloadType } from "../../../../message-bridge/types";
import { getPopupPath, UIRoutes } from "../../../../popup-routes";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getBaseUrl } from "../../../../utils/url";
import { ErrorCodes, EthereumRequest } from "../../../types";
import { UserAccount, UserSelectedAccount } from "../internal/initializeWallet";

export const connectAccount: BackgroundOnMessageCallback<void, EthereumRequest<string>> = async (
    req
) => {
    const [currentTabUrl] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
    })
    const origin = currentTabUrl.url ?? '';
    
    const domain = getBaseUrl(origin);

    if (!req.msg || !req.msg.params || !req.msg.params.length) {
        throw getCustomError('ethRequestAccounts: invalid data');
    }

    const [accountToConnect] = req.msg.params;

    const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS)

    if (!domain) {
        throw getCustomError('Invalid sender origin')
    }

    let connectedAddresses = await storageDomains.get<string[]>(domain)

    const addressArrayIndex = connectedAddresses?.map(getAddress)?.indexOf(getAddress(accountToConnect));
    
    if(addressArrayIndex !== undefined && addressArrayIndex > -1)
        throw getCustomError('Account is already connected')

    connectedAddresses?.push(accountToConnect);
    
    await storageDomains.set(domain, connectedAddresses);
}