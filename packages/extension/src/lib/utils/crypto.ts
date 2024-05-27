import cryptoJS from 'crypto-js';

export const encryptValue = (message: string, key: string) => {
  return cryptoJS.AES.decrypt(message, key).toString(cryptoJS.enc.Utf8);
};

export const decryptValue = (ciphertext: string, key: string) => {
  return cryptoJS.AES.decrypt(ciphertext, key).toString(cryptoJS.enc.Utf8);
};

export const hash = (message: string) => {
  return cryptoJS.SHA3(message).toString(cryptoJS.enc.Utf8);
};
