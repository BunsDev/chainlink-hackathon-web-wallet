import { ethers } from 'ethers';
// import LocalForageLib from 'localforage';
import Storage from '../../lib/storage/index';
import LocalForage from '../../lib/storage/local-forage';

var CryptoJS = require('crypto-js');

// LocalForageLib.defineDriver(DummyDriver);
const localForage = new LocalForage('walletProxy');
const walletStorage = new Storage('walletStorage', { storage: localForage });

export async function createPasswordForMnemonic(
  mnemonicPhrase: string,
  password: any
) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonicPhrase);
  const cryptedPrivateKey = CryptoJS.AES.encrypt(
    wallet.privateKey,
    password
  ).toString();
  await walletStorage.set('AesPk', cryptedPrivateKey);
}

export async function decryptPrivatKeyViaPassword(password: any) {
  const cryptedPk = await walletStorage.get('AesPk');

  if (!cryptedPk) return console.log('!aesPk');

  const decryptedPrivateKey = CryptoJS.AES.decrypt(
    cryptedPk,
    password
  ).toString(CryptoJS.enc.Utf8);

  return decryptedPrivateKey;
}

export async function isPresentCryptedPrivateKeyAtStorage() {
  let isPresent: Boolean = false;
  const cryptedPk = await walletStorage.get('AesPk');

  if (cryptedPk) {
    isPresent = true;
  }

  return isPresent;
}

export function clearPkFromStorage() {
  chrome.storage.sync.remove(['AesPk']);
}
