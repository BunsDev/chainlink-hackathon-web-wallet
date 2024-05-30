import { BackgroundOnMessageCallback } from "../../../../message-bridge/bridge";
import { RuntimePostMessagePayload } from "../../../../message-bridge/types";
import { getSessionPassword } from "../../../../storage/common";
import { EthereumRequest } from "../../../types";

export const isLocked: BackgroundOnMessageCallback<boolean> = async (request: RuntimePostMessagePayload, domain: string) => {
    const password = await getSessionPassword();
    return !password;
}