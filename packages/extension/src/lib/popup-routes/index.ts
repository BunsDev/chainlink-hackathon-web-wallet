export const getPopupPath = (page: string): string => {
  return `popup.html#/${page}`;
};

export const UIRoutes = {
  loading: {
    path: 'loading',
    component: {},
    name: 'loading',
  },
  unlock: {
    path: 'unlock',
    component: {},
    name: 'unlock',
  },
  initializeWallet: {
    path: 'initialize-wallet',
    component: {},
    name: 'initializeWallet',
  },
  ethSign: {
    path: 'eth-sign',
    name: 'ethSign',
    component: {},
  },
  ethSendTransaction: {
    path: 'eth-send-transaction',
    name: 'ethSendTransaction',
    component: {},
  },
  walletImportSmartWallet: {
    path: 'wallet-import-smart-wallet',
    name: 'walletImportSmartWallet',
    component: {},
  },
  ethSignTypedData: {
    path: 'eth-sign-typedData',
    name: 'ethSignTypedData',
    component: {},
  },
  ethGetEncryptionKey: {
    path: 'eth-get-encryption-key',
    name: 'ethGetEncryptionKey',
    component: {},
  },
  ethDecrypt: {
    path: 'eth-decrypt',
    name: 'ethDecrypt',
    component: {},
  },
  ethConnectDApp: {
    path: 'eth-connect-dapp',
    name: 'ethConnectDApp',
    component: {},
  },
  ethSwitchChain: {
    path: 'eth-switch-chain',
    name: 'ethSwitchChain',
    component: {},
  },
  ethHWVerify: {
    path: 'eth-hw-verify',
    name: 'ethHWVerify',
    component: {},
  },
  welcome: {
    path: 'welcome',
    name: 'welcome',
    component: {},
  },
  createPassword: {
    path: 'create-password',
    name: 'createPassword',
    component: {},
  },
  enterMnemonic: {
    path: 'enter-mnemonic',
    name: 'enterMnemonic',
    component: {},
  },
  generateContract: {
    path: 'generate-contract',
    name: 'generateContract',
    component: {},
  },
};
