import { BigNumber, ethers, UnsignedTransaction, Wallet } from "ethers";
import { getCustomError } from "../../../../errors";
import { TransactionRequest } from '@ethersproject/abstract-provider'
import WindowPromise, { BackgroundOnMessageCallback, sendMessageFromBackgroundToBackground, sendRuntimeMessageToPopup } from "../../../../message-bridge/bridge";
import { RuntimeOnMessageResponse, RuntimePostMessagePayload, RuntimePostMessagePayloadType } from "../../../../message-bridge/types";
import { getPopupPath, UIRoutes } from "../../../../popup-routes";
import Storage, { StorageNamespaces } from "../../../../storage";
import { getBaseUrl } from "../../../../utils/url";
import { EthereumRequest } from "../../../types";
import { UserAccount, UserSelectedAccount } from "../internal/initializeWallet";
import { getCurrentNetwork, makeRpcRequest } from "../../../../requests/toRpcNode";
import { Wallet__factory } from "../../../../../typechain";
import { getActiveAccountForSite } from "../../helpers";
import { getAddress } from "ethers/lib/utils";

export const ethCall: BackgroundOnMessageCallback<unknown, EthereumRequest<TransactionRequest>> = async (
    request,
    origin,
) => {
    console.log('ethCall', request);
    const payload = request.msg;
    const domain = getBaseUrl(origin);

    if (!payload || !payload.params || !payload.params.length) {
        throw getCustomError('ethSendTransaction: invalid data');
    }

    const [txRequest] = payload.params;

    if (!domain) {
        throw getCustomError('ethRequestAccounts: invalid sender origin')
    }

    const userSelectedAccount = await getActiveAccountForSite(domain);

    if (!userSelectedAccount) {
        throw getCustomError('Account is not connected')
    }

    const isThroughUndasProxy = 
        userSelectedAccount.undasContract &&
            userSelectedAccount.isUndasContractSelected &&
            txRequest.to && 
            getAddress(txRequest.to) !== getAddress(userSelectedAccount.undasContract)

    if (isThroughUndasProxy) {
        console.log('eth_call through undas')
        txRequest.from = userSelectedAccount.address;

        // const walletContract = Wallet__factory.connect(userSelectedAccount.undasContract, rpcProvider);

        // if (!txRequest.to) throw getCustomError("missing argument");

        // console.log('tx.to', txRequest.to)
        // console.log('tx.datatx.data', txRequest.data)

        // const populatedTx = await walletContract.populateTransaction.makeTransaction(
        //     txRequest.to, 
        //     txRequest.data ?? '',
        //     txRequest.value ?? '0');

        // console.log('populatedTx', populatedTx)

        // txRequest.data = populatedTx.data
        // txRequest.to = populatedTx.to

        // delete txRequest.value;
    }

    // if (!txRequest.nonce) {
    //     txRequest.nonce = await rpcProvider.getTransactionCount(userSelectedAccount.address)
    // }

    // // if (!txRequest.gasPrice) {
    // //     const estimatedGasPrice = await rpcProvider.getFeeData();

    // //     txRequest.gasPrice = estimatedGasPrice.gasPrice?.toHexString() ?? undefined;
    // // }

    // if (!txRequest.gasLimit) {
    //     const estimatedGas = await rpcProvider.estimateGas(txRequest).catch(err => {console.error(err); return BigNumber.from(1_000_000)});
    //     txRequest.gasLimit =
    //         // (txRequest as any).gas?.toString() ??
    //         estimatedGas.toHexString();
    // }

    // delete (txRequest as any).gas;

    // payload.params[0] = txRequest;

    console.log('eth call request', request);
    
    return makeRpcRequest(request, origin);
}