import { assert } from "chai"
import { getAddress } from "ethers/lib/utils"
import Browser from "webextension-polyfill"
import { sendMessageToTab } from "../../../message-bridge/bridge"
import { PostMessageDestination } from "../../../message-bridge/types"
import Storage, { StorageNamespaces } from "../../../storage"
import { getBaseUrl } from "../../../utils/url"
import { EthereumRequest, MessageMethod } from "../../types"
import { UserAccount, UserSelectedAccount } from "../methods/internal/initializeWallet"

export const sendAccountChangedToTab = async (
    tabDomain: string,
    switchTo: string | undefined
) => {
    const tabs = (await Browser.tabs.query({}) ?? []).filter(v=>getBaseUrl(v.url ?? '') === tabDomain);

    tabs.forEach(tab => {
        if (!tab || !tab.id) return;

        sendMessageToTab<EthereumRequest<string | undefined>>(
            tab.id,
            PostMessageDestination.WINDOW,
            {
                method: MessageMethod.changeAddress,
                params: [switchTo]
            }
        )    
    });
    
}

// export const sendAccountChangedToAllTabs = async (
//     accountChangedTo: UserAccount,
//     changedToContract: boolean
// ) => {
//     Browser.tabs.query({}).then(tabs => {
//         tabs?.forEach(t => {
//             if (!t || !t.id) return;

//             sendMessageToTab<EthereumRequest<string>>(
//                 t.id,
//                 PostMessageDestination.WINDOW,
//                 {
//                     method: MessageMethod.changeAddress,
//                     params: [changedToContract ? accountChangedTo.undasContract : accountChangedTo.address]
//                 }
//             )  
//         })
//     })
// }

// TODO: move to global helpers
const addressCmp = (address1: string | undefined, address2: string | undefined) => {
    if(!address1 || !address2) return false;
    return getAddress(address1 ?? '') === getAddress(address2 ?? '')
}

export const getActiveAccountForSite = async (
    domain: string,
    connectedDomainsStorage: Storage = new Storage(StorageNamespaces.CONNECTED_DOMAINS), 
    accountsStorage: Storage = new Storage(StorageNamespaces.USER_WALLETS), 
): Promise<UserSelectedAccount | undefined> =>{
    const connectedAddresses = await connectedDomainsStorage.get<string[]>(domain)
    const userSelectedAccount = await accountsStorage.get<UserSelectedAccount>('selectedAccount');

    if(!userSelectedAccount) return undefined;

    if(userSelectedAccount?.undasContract && userSelectedAccount?.isUndasContractSelected &&  
        connectedAddresses?.find(v => addressCmp(v, userSelectedAccount.undasContract))
    ){
        return userSelectedAccount;
    } else if(connectedAddresses?.find(v => addressCmp(v, userSelectedAccount.address))) {
        return {
            ...userSelectedAccount,
            isUndasContractSelected: false
        }
    }else {
        if(!connectedAddresses || !connectedAddresses.length) return undefined;

        const userAccounts = await accountsStorage.get<UserAccount[]>('accounts');

        if(!userAccounts || !userAccounts.length) return undefined;

        const activeAddress = connectedAddresses[0];

        const activeAccount = userAccounts.find(acc=> addressCmp(acc.address, activeAddress) || addressCmp(acc.undasContract, activeAddress))
        
        if(!activeAccount) return undefined;

        return {
            ...activeAccount,
            isUndasContractSelected: addressCmp(activeAccount.undasContract, activeAddress)
        }
    }

}