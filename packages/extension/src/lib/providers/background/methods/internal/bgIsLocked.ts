import { BackgroundOnMessageCallback } from "../../../../message-bridge/bridge";
import { RuntimePostMessagePayload } from "../../../../message-bridge/types";
import { EthereumRequest } from "../../../types";

export const bgIsLocked: BackgroundOnMessageCallback<boolean> = async (request: RuntimePostMessagePayload, domain: string) => {
    console.log('bgIsLocked')
    // TODO: implement
    return false;
}