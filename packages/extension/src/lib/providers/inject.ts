import EventEmitter from 'eventemitter3';
import { handleIncomingMessage } from '../message-handlers/injected-provider-message-handler';

import {
  EthereumRequest,
  EthereumResponse,
  JsonRpcRequest,
  JsonRpcResponse,
} from './types';
import {
  ProviderOptions,
  ProviderInterface,
  SendMessageHandler,
} from './types';

export class Provider extends EventEmitter implements ProviderInterface {
  chainId: string | null;
  networkVersion: string;
  isProxyWallet: boolean;
  isMetaMask: boolean;
  selectedAddress: string | null;
  connected: boolean;
  autoRefreshOnNetworkChange = false;

  readonly name = 'ethereum' as const;
  readonly version: string = '0.0.1' as const; // TODO move to config
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.chainId = null; //deprecated
    this.networkVersion = '0x1'; //deprecated
    this.isProxyWallet = true;
    this.isMetaMask = true;
    this.selectedAddress = null; //deprecated
    this.connected = true;
    this.sendMessageHandler = options.sendMessageHandler;
  }
  async request(request: EthereumRequest): Promise<EthereumResponse> {
    if (this.chainId === null) {
      await this.sendMessageHandler(
        JSON.stringify({
          method: 'eth_chainId',
          params: [],
        })
      ).then((res) => {
        this.chainId = res;
        this.networkVersion = res;
      });
    }
    if (
      this.selectedAddress === null &&
      request.method === 'eth_requestAccounts'
    ) {
      return this.sendMessageHandler(JSON.stringify(request)).then((res) => {
        this.selectedAddress = res[0];
        this.connected = true;
        return res;
      });
    }
    return this.sendMessageHandler(JSON.stringify(request));
  }
  enable(): Promise<any> {
    console.log('enable', this.connected);

    return this.request({ method: 'eth_requestAccounts' });
  }
  isConnected(): boolean {
    console.log('is connected', this.connected);
    return this.connected;
  }
  //deprecated
  send(method: string, params?: Array<unknown>): Promise<EthereumResponse> {
    return this.request({ method, params });
  }
  // //deprecated
  sendAsync(
    data: JsonRpcRequest,
    callback: (err: Error | null, res?: JsonRpcResponse) => void
  ): void {
    const { method, params } = data as EthereumRequest;
    this.request({ method, params })
      .then((res) => {
        callback(null, {
          id: data.id,
          jsonrpc: '2.0',
          result: res,
        });
      })
      .catch((err) => callback(err));
  }
  handleMessage(msg: string): void {
    console.log('handleMessage');
    handleIncomingMessage(this, msg);
  }
}

class ProviderProxyHandler implements ProxyHandler<Provider> {
  private readonly proxymethods = ['request', 'sendAsync', 'send'];
  private readonly writableVars = ['autoRefreshOnNetworkChange'];
  ownKeys(target: Provider) {
    return Object.keys(target).concat(this.proxymethods);
  }
  set(target: Provider, name: keyof Provider, value: any) {
    if (!this.ownKeys(target).includes(name)) this.proxymethods.push(name);
    return Reflect.set(target, name, value);
  }
  getOwnPropertyDescriptor(target: Provider, name: keyof Provider) {
    return {
      value: this.get(target, name),
      configurable: true,
      writable: this.writableVars.includes(name),
      enumerable: true,
    };
  }
  get(target: Provider, prop: keyof Provider) {
    if (typeof target[prop] === 'function') {
      return (target[prop] as () => any).bind(target);
    }
    return target[prop];
  }
  has(target: Provider, name: keyof Provider) {
    return this.ownKeys(target).includes(name);
  }
}

const injectDocument = (
  window: Record<string, any>,
  options: ProviderOptions
): void => {
  const provider = new Provider(options);
  window[provider.name] = new Proxy(provider, new ProviderProxyHandler()); //proxy is needed due to web3js 1.3.0 callbackify issue. Used in superrare
  window.proxyWallet.provider = provider;
};
export default injectDocument;
