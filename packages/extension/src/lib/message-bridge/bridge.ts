import { EventEmitter } from 'eventemitter3';
import Browser, { commands } from 'webextension-polyfill';
import { getCustomError, getError } from '../errors';
import {
  handleBackgroundMessage,
  InternalBgMethods,
} from '../message-handlers/background-message-handler';
import { getPopupPath, UIRoutes } from '../popup-routes';
import {
  ErrorCodes,
  EthereumRequest,
  JsonRpcRequest,
  SendMessageHandler,
} from '../providers/types';
import { generateUuid } from '../utils/uuid';
import {
  PostMessageDestination,
  RuntimeOnMessageResponse,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
  WindowCSMessageBridge,
  WindowPostMessagePayload,
  WindowPostMessagePayloadType,
} from './types';

export const sendMessageToNewPopupWindow = async <TMsg = any, TReturn = any>(
  tabId: number,
  msg: TMsg
): Promise<RuntimeOnMessageResponse<TReturn>> => {
  try {
    return { result: await Browser.tabs.sendMessage(tabId, msg) };
  } catch (error: any) {
    return { error };
  }
};

export const sendMessageToTab = async <TMsg = any, TReturn = any>(
  tabId: number,
  destination: PostMessageDestination,
  msg: TMsg,
  type: RuntimePostMessagePayloadType = RuntimePostMessagePayloadType.EXTERNAL
): Promise<RuntimeOnMessageResponse<TReturn>> => {
  try {
    return {
      result: await Browser.tabs.sendMessage(
        tabId,
        new RuntimePostMessagePayload<TMsg>({
          msg: msg,
          destination: destination,
          type,
        })
      ),
    };
  } catch (error: any) {
    return { error };
  }
};

const sendRuntimeMessage = async <TMsg = any, TReturn = any>(
  destination: PostMessageDestination,
  msg: TMsg,
  type: RuntimePostMessagePayloadType = RuntimePostMessagePayloadType.EXTERNAL
) => {
  return new Promise<RuntimeOnMessageResponse<TReturn>>((resolve, _) => {
    console.debug(`send message to ${destination}`, msg);
    chrome.runtime.sendMessage(
      new RuntimePostMessagePayload<TMsg>({
        msg: msg,
        destination: destination,
        type,
      }),
      (response: RuntimeOnMessageResponse) => {
        console.log(`${destination} response`, response);
        resolve(response);
      }
    );
  });
};

export const sendRuntimeMessageToBackground = <TMsg = any, TReturn = any>(
  msg: TMsg,
  type: RuntimePostMessagePayloadType = RuntimePostMessagePayloadType.EXTERNAL
) => {
  return sendRuntimeMessage<TMsg, TReturn>(
    PostMessageDestination.BACKGROUND,
    msg,
    type
  );
};

export const sendRuntimeMessageToPopup = <TMsg = any, TReturn = any>(
  msg: TMsg
) => {
  return sendRuntimeMessage<TMsg, TReturn>(PostMessageDestination.POPUP, msg);
};

export const sendRuntimeMessageToWindow = <TMsg = any, TReturn = any>(
  msg: TMsg
) => {
  return sendRuntimeMessage<TMsg, TReturn>(PostMessageDestination.WINDOW, msg);
};

export type BackgroundOnMessageCallback<TResult = any, TRequest = any> = (
  request: RuntimePostMessagePayload<TRequest>,
  domain: string
) => Promise<TResult>;

export type PopupOnMessageCallback<
  TResult = any,
  TRequest = any
> = BackgroundOnMessageCallback<TResult, TRequest>;

export type ContentOnMessageCallback<
  TResult = any,
  TRequest = any
> = BackgroundOnMessageCallback<TResult, TRequest>;

export type NewPopupWindowOnMessageCallback<TResult = any, TRequest = any> = (
  request: RuntimePostMessagePayload<TRequest>
) => Promise<TResult>;

const runtimeOnMessage = (
  destination: PostMessageDestination,
  callback: BackgroundOnMessageCallback
) => {
  chrome.runtime.onMessage.addListener(function (
    request: RuntimePostMessagePayload,
    sender,
    sendResponse
  ) {
    if (request.destination !== destination) return;

    console.log(`${destination} runtimeOnMessage`, request);

    const promise = async () => {
      try {
        const res = await callback(request, sender.origin ?? 'unknown');
        console.log(`${destination} RUNTIME RESPONSE`, res);
        sendResponse({
          result: res,
        } as RuntimeOnMessageResponse);
      } catch (err) {
        console.log(`${destination} RUNTIME ON MESSAGE ERROR`, err);
        sendResponse({
          error: err,
        } as RuntimeOnMessageResponse);
      }
    };

    promise().then(sendResponse);

    return true;
  });
};

export const backgroundOnMessage = async (
  callback: BackgroundOnMessageCallback
) => {
  runtimeOnMessage(PostMessageDestination.BACKGROUND, callback);
};

export const popupOnMessage = async (callback: PopupOnMessageCallback) => {
  runtimeOnMessage(PostMessageDestination.POPUP, callback);
};

export const contentOnMessage = async (callback: PopupOnMessageCallback) => {
  runtimeOnMessage(PostMessageDestination.CONTENT_SCRIPT, callback);
};

export const windowOnRuntimeMessage = async (
  callback: PopupOnMessageCallback
) => {
  runtimeOnMessage(PostMessageDestination.WINDOW, callback);
};

export const newPopupOnMessage = async <TResult = any, TRequest = any>(
  callback: NewPopupWindowOnMessageCallback<TResult, TRequest>
) => {
  Browser.runtime.onMessage.addListener(
    async (message: RuntimePostMessagePayload) => {
      if (message.destination !== PostMessageDestination.NEW_POPUP) return;

      try {
        const result = await callback(message);
        return result;
      } catch (error) {
        alert(error);

        return { error } as RuntimeOnMessageResponse;
      }
    }
  );
};

export const sendMessageFromBackgroundToBackground = async <
  TResponse = unknown,
  TRequest = any
>(
  req: TRequest,
  type: RuntimePostMessagePayloadType,
  domain: string,
  triggerPopup: boolean = true
) => {
  return <TResponse>handleBackgroundMessage(
    new RuntimePostMessagePayload({
      destination: PostMessageDestination.BACKGROUND,
      msg: req,
      type,
      triggerPopup,
    }),
    domain
  );
};

const UNLOCK_PATH = getPopupPath(UIRoutes.unlock.path);

// let currentWindowId: number | undefined;

class WindowPromise {
  private _currentOpenedTab: number | undefined;

  private async getRawResponse<TMsg, TResult>(
    url: string,
    msg: TMsg,
    tabId: number
  ): Promise<RuntimeOnMessageResponse<TResult>> {
    return new Promise((resolve) => {
      Browser.tabs.onUpdated.addListener(function listener(_tabId, info, tab) {
        console.log('status: ', tab, url, _tabId, tabId);

        if (info.status === 'complete' && _tabId === tabId && tab.url === url) {
          console.log('status: completed');
          resolve(
            sendMessageToNewPopupWindow(
              tabId,
              new RuntimePostMessagePayload<TMsg>({
                msg,
                destination: PostMessageDestination.NEW_POPUP,
              })
            )
          );
          Browser.tabs.onUpdated.removeListener(listener);
        }
      });
      Browser.tabs.update(tabId, { url });
    });
  }

  private removeTab(tabId: number) {
    Browser.tabs.get(tabId).then((info) => {
      Browser.windows.remove(info.windowId!);
    });
  }

  async getResponse<TResult = any, TMsg = EthereumRequest>(
    url: string,
    msg: TMsg,
    unlockKeyring = false
  ): Promise<RuntimeOnMessageResponse<TResult>> {
    const loadingPath = '/' + getPopupPath(UIRoutes.loading.path);
    console.log('loadingPath', loadingPath);
    const windowInfo = await Browser.windows.create({
      url: loadingPath,
      type: 'panel',
      focused: true,
      height: 700,
      width: 500,
      top: 0,
    });

    console.log('window info', windowInfo);

    const tabId: number | undefined = windowInfo.tabs?.length
      ? windowInfo.tabs[0].id
      : 0;
    console.log('tabId', tabId);

    const [currentTabUrl] = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log('currentTabUrl: ', currentTabUrl);

    if (typeof tabId === 'undefined') {
      return Promise.resolve({
        error: getCustomError('unknown error, no tabId'),
      });
    }
    const waitForWindow = async (): Promise<void> => {
      // eslint-disable-next-line no-empty
      while ((await Browser.tabs.get(tabId)).status !== 'complete') {}
    };
    await waitForWindow();
    console.log('waitedForWindow');

    const monitorTabs = (): Promise<RuntimeOnMessageResponse> => {
      return new Promise((resolve) => {
        Browser.tabs.onRemoved.addListener(function tabListener(_tabId) {
          console.log('onRemoved');
          if (_tabId === tabId) {
            console.log('onRemoved matched tab');
            Browser.tabs.onRemoved.removeListener(tabListener);
            resolve({
              error: getError(ErrorCodes.userRejected),
            });
          }
        });
      });
    };

    const executePromise = async (): Promise<RuntimeOnMessageResponse> => {
      const isKeyRingLocked = await sendMessageFromBackgroundToBackground<
        boolean,
        EthereumRequest
      >(
        {
          method: InternalBgMethods.IS_LOCKED,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL,
        currentTabUrl.url ?? 'unknown'
      );

      console.log('isKeyRingLockedd', isKeyRingLocked);

      if (unlockKeyring && isKeyRingLocked) {
        console.log('unlock keyring', isKeyRingLocked);

        const unlockKeyring = await this.getRawResponse(
          Browser.runtime.getURL(UNLOCK_PATH),
          msg,
          tabId
        );
        if (unlockKeyring.error) {
          this.removeTab(tabId);
          return unlockKeyring;
        } else {
          return await this.getRawResponse(
            Browser.runtime.getURL(url),
            msg,
            tabId
          ).then((res) => {
            this.removeTab(tabId);
            return res;
          });
        }
      }
      return await this.getRawResponse(
        Browser.runtime.getURL(url),
        msg,
        tabId
      ).then((res) => {
        this.removeTab(tabId);
        return res;
      });
    };

    console.log('wait for promises');

    return Promise.race([monitorTabs(), executePromise()]);
  }
}
export default WindowPromise;
