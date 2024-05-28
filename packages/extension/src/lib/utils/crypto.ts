import cryptoJS from 'crypto-js';

export const encryptValue = (message: string, key: string) => {
  return cryptoJS.AES.encrypt(message, key).toString();
};

export const decryptValue = (ciphertext: string, key: string) => {
  return cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
};

export const hash = (message: string) => {
  return cryptoJS.SHA3(JSON.stringify({ message })).toString(cryptoJS.enc.Hex);
};
