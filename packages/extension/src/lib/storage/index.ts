import { BrowserStorageArea } from './types';
import LocalForage from './local-forage';

export enum StorageNamespaces {
  CONNECTED_DOMAINS = 'connected-domains',
  COMMON = 'common',
  USER_ADDRESSES = 'user-addresses',
  USER_WALLETS = 'user-wallets',
  USER_TRANSACTIONS_HISTORY = 'user-tx-history',
  WALLET_CONTRACT = 'wallet-contract',
}

export interface StorageOptions {
  storage?: BrowserStorageArea;
}

class Storage {
  namespace: string;

  private storage: BrowserStorageArea;

  constructor(namespace: any, options: StorageOptions = {}) {
    if (!options.storage) options.storage = new LocalForage(namespace);
    this.namespace = namespace;
    this.storage = options.storage;
  }

  async get<TReturn>(key: string) {
    const vals = await this.storage.get(this.namespace);
    if (vals[this.namespace] && vals[this.namespace][key])
      return vals[this.namespace][key] as TReturn;
    return null;
  }

  async getAllKeys() {
    const vals = await this.storage.get(this.namespace);
    if (vals && vals[this.namespace]) return Object.keys(vals[this.namespace]);
    return [];
  }

  async set<TValue>(key: string, val: TValue) {
    let vals = await this.storage.get(this.namespace);
    vals = vals[this.namespace] ? vals[this.namespace] : {};
    vals[key] = val;
    return this.storage.set({
      [this.namespace]: vals,
    });
  }

  async remove(key: string) {
    let vals = await this.storage.get(this.namespace);
    vals = vals[this.namespace] ? vals[this.namespace] : {};
    delete vals[key];
    return this.storage.set({
      [this.namespace]: vals,
    });
  }

  async clear() {
    return this.storage.remove(this.namespace);
  }
}

export default Storage;
