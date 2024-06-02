import EthereumProviderInject, { Provider } from '../lib/providers/inject';
import {
  WindowPostMessagePayload,
  WindowPostMessagePayloadType,
} from '../lib/message-bridge/types';
import {
  CS_WINDOW_BRIDGE,
  initWindowBridge,
  sendMessageFromWindowToCS as sendMessageHandler,
  windowOnMessage,
} from '../lib/message-bridge/event-bridge';

declare global {
  interface Window {
    proxyWallet: {
      provider?: Provider;
    };
  }
}

window.proxyWallet = {};

initWindowBridge('inject');

const onWindowMessage = async (...args: any[]) => {
  const msg = args[0] as WindowPostMessagePayload;
  console.log('WindowToCS Response Injected', args);
  window.proxyWallet?.provider?.handleMessage(msg.msg ?? '');
};
// TODO: revise
CS_WINDOW_BRIDGE.windowSubscribeResponse(onWindowMessage);

EthereumProviderInject(window, {
  sendMessageHandler,
});
