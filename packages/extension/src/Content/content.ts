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
    console.log('inject script');
    const injectURL = browser.runtime.getURL('inject.bundle.js');
    console.log('url', injectURL);
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.src = `${injectURL}`;
    scriptTag.id = 'proxy-wallet-inject';

    scriptTag.onload = function () {
      console.info('Hello from the content-script');
      container.removeChild(scriptTag);
    };

    container.insertBefore(scriptTag, container.children[0]);
  } catch (error) {
    console.error('ProxyWallet: Provider injection failed.', error);
  }
}

const onWindowMessage = async (...args: any[]) => {
  const payload = args[0] as WindowPostMessagePayload;

  console.log('onWindowMessage', args);

  if (!payload || payload.type !== WindowPostMessagePayloadType.REQUEST) {
    console.debug('CS onWindowMessage: unsatisfied payload');
    return;
  }

  // console.log('CS msg handle: ', msg);
  const resp = await sendRuntimeMessageToBackground(
    JSON.parse(payload.msg) as EthereumRequest
  );

  console.log('WindowToCS send response', resp);

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
  console.log('windowOnRuntimeMessage', req.msg);

  window.postMessage(
    new WindowPostMessagePayload({
      msg: JSON.stringify(req.msg),
      type: WindowPostMessagePayloadType.RESPONSE,
    }).toJson()
  );

  return undefined;
});

injectScript();
