import cryptoJs from 'crypto-js';

export const hash = (message: string) => {
  return cryptoJs.SHA3(JSON.stringify({ message })).toString(cryptoJs.enc.Hex);
};
