import { EventEmitter } from "eventemitter3";
import { ProviderError } from "../providers/types";
import { windowOnMessage } from "./event-bridge";

export enum WindowPostMessagePayloadType {
    REQUEST = 'request',
    RESPONSE = 'response'
}

export enum PostMessageDestination {
    WINDOW = 'window',
    CONTENT_SCRIPT = 'content-script',
    BACKGROUND = 'background',
    NEW_POPUP = 'new-popup',
    POPUP = 'popup',

}

export class WindowPostMessagePayload {
    public type: WindowPostMessagePayloadType = WindowPostMessagePayloadType.REQUEST;
    public msg: string = '';
    public reqUid?: string = undefined;

    constructor(
        init: Partial<WindowPostMessagePayload>
    ) {
        Object.assign(this, init);
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    public static fromJson(json: string): WindowPostMessagePayload | undefined {
        try {
            return <WindowPostMessagePayload>JSON.parse(json)
        } catch (er) {
            return undefined;
        }
    }
}

export enum RuntimePostMessagePayloadType {
    INTERNAL = 'internal',
    EXTERNAL = 'external'
}

export type RuntimeOnMessageResponse<TResult = any> = {
    result?: TResult;
    error?: ProviderError;
}

export class RuntimePostMessagePayload<TMsg = any> {
    public destination?: PostMessageDestination = PostMessageDestination.CONTENT_SCRIPT;
    public msg?: TMsg = undefined;
    public type: RuntimePostMessagePayloadType = RuntimePostMessagePayloadType.EXTERNAL;
    public triggerPopup: boolean = true;

    constructor(
        init: Partial<RuntimePostMessagePayload>
    ) {
        Object.assign(this, init);
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    public static fromJson(json: string): RuntimePostMessagePayload | undefined {
        try {
            return <RuntimePostMessagePayload>JSON.parse(json)
        } catch (er) {
            return undefined;
        }
    }
}


export const WINDOW_CS_REQUEST_EN = 'window.cs.request';
export const WINDOW_CS_RESPONSE_EN = 'window.cs.response';

export class WindowCSMessageBridge {
    private readonly WINDOW_MSG_EE = new EventEmitter();

    constructor(
        public readonly prefix?: string) {
        windowOnMessage(
            async (msg) => {
                this.WINDOW_MSG_EE.emit(
                    msg.type == WindowPostMessagePayloadType.REQUEST ?
                        WINDOW_CS_REQUEST_EN : WINDOW_CS_RESPONSE_EN,
                    msg);
            }
        )
    }

    windowSubscribeRequest(callback: (...args: any[]) => void, content?: any) {
        this.WINDOW_MSG_EE.addListener(WINDOW_CS_REQUEST_EN, callback, content)
    }

    windowSubscribeResponse(callback: (...args: any[]) => void, content?: any) {
        this.WINDOW_MSG_EE.addListener(WINDOW_CS_RESPONSE_EN, callback, content)
    }

    windowUnSubscribeRequest(callback: (...args: any[]) => void, content?: any) {
        this.WINDOW_MSG_EE.removeListener(WINDOW_CS_REQUEST_EN, callback, content)
    }

    windowUnSubscribeResponse(callback: (...args: any[]) => void, content?: any) {
        this.WINDOW_MSG_EE.removeListener(WINDOW_CS_RESPONSE_EN, callback, content)
    }

}

