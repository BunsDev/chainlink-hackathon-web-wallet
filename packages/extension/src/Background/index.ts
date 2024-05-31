import Browser from 'webextension-polyfill';
import { backgroundOnMessage } from '../lib/message-bridge/bridge';
import { handleBackgroundMessage } from '../lib/message-handlers/background-message-handler';
import { getPopupPath, UIRoutes } from '../lib/popup-routes';
import { getNetwork } from '../lib/requests/toRpcNode';

backgroundOnMessage(handleBackgroundMessage);

Browser.runtime.onInstalled.addListener(function (details) {
  if (details.reason !== 'install') {
    return;
  }

  setTimeout(() => {
    Browser.tabs.create({
      active: true,
      url: getPopupPath(UIRoutes.initializeWallet.path),
    });
  }, 1000);
});

Browser.notifications.onClicked.addListener(async (nId) => {
  const split = nId.split('|');

  if (split[0] === 'TX') {
    const [id, txId, networkName] = split as [string, string, string];

    const network = getNetwork(networkName)!;
    const txUrl = network.explorer + '/tx/' + txId;
    Browser.tabs.create({ url: txUrl });
  }
});
