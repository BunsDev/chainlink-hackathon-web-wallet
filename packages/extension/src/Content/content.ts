import browser from 'webextension-polyfill';
import {
  contentOnMessage,
  sendRuntimeMessageToBackground,
  windowOnRuntimeMessage,
} from '../lib/message-bridge/bridge';
import {
  CS_WINDOW_BRIDGE,
  initWindowBridge,
} from '../lib/message-bridge/event-bridge';
import {
  PostMessageDestination,
  RuntimePostMessagePayload,
  WindowPostMessagePayload,
  WindowPostMessagePayloadType,
} from '../lib/message-bridge/types';
import { EthereumRequest } from '../lib/providers/types';

function injectScript() {
  try {
    const injectURL = browser.runtime.getURL('inject.bundle.js');
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.src = `${injectURL}`;
    scriptTag.id = 'proxy-wallet-inject';

    scriptTag.onload = function () {
      container.removeChild(scriptTag);
    };

    container.insertBefore(scriptTag, container.children[0]);
  } catch (error) {
    console.error('ProxyWallet: Provider injection failed.', error);
  }
}

const onWindowMessage = async (...args: any[]) => {
  const payload = args[0] as WindowPostMessagePayload;

  if (!payload || payload.type !== WindowPostMessagePayloadType.REQUEST) {
    return;
  }

  const resp = await sendRuntimeMessageToBackground(
    JSON.parse(payload.msg) as EthereumRequest
  );

  window.postMessage(
    new WindowPostMessagePayload({
      msg: JSON.stringify(resp),
      type: WindowPostMessagePayloadType.RESPONSE,
      reqUid: payload.reqUid,
    }).toJson()
  );
};

initWindowBridge('content-script');

CS_WINDOW_BRIDGE.windowSubscribeRequest(onWindowMessage);

windowOnRuntimeMessage(async (req, domain) => {
  window.postMessage(
    new WindowPostMessagePayload({
      msg: JSON.stringify(req.msg),
      type: WindowPostMessagePayloadType.RESPONSE,
    }).toJson()
  );

  return undefined;
});

injectScript();
