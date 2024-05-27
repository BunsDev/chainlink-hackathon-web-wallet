import Browser from "webextension-polyfill";
import { backgroundOnMessage } from "../lib/message-bridge/bridge";
import { handleBackgroundMessage } from "../lib/message-handlers/background-message-handler";
import { getPopupPath, UIRoutes } from "../lib/popup-routes";

backgroundOnMessage(handleBackgroundMessage)

Browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason !== 'install') { return; }

    setTimeout(() => {
        Browser.tabs.create({
            active: true,
            url: getPopupPath(UIRoutes.initializeWallet.path)
        })
    }, 1000)
});