import { getAddress } from "ethers/lib/utils";
import Browser from "webextension-polyfill";
import { getCustomError, getError } from "../../../../errors";
import WindowPromise, { BackgroundOnMessageCallback, sendRuntimeMessageToPopup } from "../../../../message-bridge/bridge";
import { RuntimeOnMessageResponse, RuntimePostMessagePayload, RuntimePostMessagePayloadType } from "../../../../message-bridge/types";
import { getPopupPath, UIRoutes } from "../../../../popup-routes";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getBaseUrl } from "../../../../utils/url";
import { ErrorCodes, EthereumRequest } from "../../../types";
import { sendAccountChangedToTab } from "../../helpers";
import { UserAccount, UserSelectedAccount } from "../internal/initializeWallet";

export const disconnectAccount: BackgroundOnMessageCallback<void, EthereumRequest<string>> = async (
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

    const [accountToDisconnect] = req.msg.params;

    const storageDomains = new Storage(StorageNamespaces.CONNECTED_DOMAINS)
    const storageWallets = new Storage(StorageNamespaces.USER_WALLETS)

    if (!domain) {
        throw getCustomError('Invalid sender origin')
    }

    const selectedAccount = await storageWallets.get<UserSelectedAccount>('selectedAccount');
    let connectedAddresses = await storageDomains.get<string[]>(domain)

    const addressArrayIndex = connectedAddresses?.map(getAddress)?.indexOf(getAddress(accountToDisconnect));

    if (addressArrayIndex === undefined || addressArrayIndex <= -1)
        throw getCustomError('Account is not connected')

    connectedAddresses?.splice(addressArrayIndex, 1);

    await storageDomains.set(domain, connectedAddresses);

    // TODO: move to helpers


    // let addressSwitchTo: string | undefined = undefined;
// 
    // const isConnected = (address?: string) => Boolean(connectedAddresses?.map(getAddress)?.includes(address ?? ''));


    // if(
    //     accountToDisconnect !== selectedAccount?.address && 
    //     accountToDisconnect !== selectedAccount?.undasContract && 
    //         (isConnected(selectedAccount?.undasContract) || 
    //         isConnected(selectedAccount?.address))
    // ) {
    //     if(selectedAccount?.isUndasContractSelected && isConnected(selectedAccount.undasContract)) {
    //         addressSwitchTo = selectedAccount.undasContract;
    //     }else {
    //         addressSwitchTo = selectedAccount?.address ?? '';
    //     }
    // } 
    
    // if(
    //     accountToDisconnect === selectedAccount?.address ||
    //     accountToDisconnect === selectedAccount?.undasContract &&
    //     (isConnected(selectedAccount?.undasContract) &&
    //         isConnected(selectedAccount?.address))
    // ) {
    //     if(selectedAccount?.isUndasContractSelected && isConnected(selectedAccount.undasContract)) {
    //         addressSwitchTo = selectedAccount.undasContract;
    //     }else {
    //         addressSwitchTo = selectedAccount?.address ?? '';
    //     }
    // } 

    // if(!addressSwitchTo) {
    //     addressSwitchTo = connectedAddresses?.length ? connectedAddresses[0] : undefined
    // }

    // sendAccountChangedToTab(domain, addressSwitchTo);
}