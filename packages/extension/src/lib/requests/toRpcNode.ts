import { ethers } from "ethers";
import { getCustomError } from "../errors";
import { BackgroundOnMessageCallback } from "../message-bridge/bridge";
import { RuntimePostMessagePayload, RuntimePostMessagePayloadType } from "../message-bridge/types";
import { EthereumRequest, JsonRpcRequest } from "../providers/types";

export const makeRpcRequest: BackgroundOnMessageCallback<unknown, EthereumRequest> = async (
    request
) => {
    const req = request.msg;

    if (!req) {
        throw getCustomError('ethRequestAccounts: invalid data');
    }


    const curNetwork = await getCurrentNetwork();
    const res = await curNetwork.rpcProvider.send(req.method, req.params ?? []);
    console.log('rpc req result', res);
    return res;
}

export const getCurrentNetwork = async () => {
    // todo: take this from local storage
    const networkConfig = {
      jsonRpcUrl:
        'https://sepolia.infura.io/v3/44aadb4903f8450dba123bf5d29a8587',
      chainId: 11155111,
    };
    return {
        ...networkConfig,
        rpcProvider: new ethers.providers.JsonRpcProvider(networkConfig.jsonRpcUrl, networkConfig.chainId)
    }
}