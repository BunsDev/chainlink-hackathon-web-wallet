import EventEmitter from "eventemitter3";
// import {
//   MiddlewareFunction,
//   NetworkNames,
//   OnMessageResponse,
//   RPCRequestType,
// } from "@enkryptcom/types";

// import { SignerType } from "@enkryptcom/types";
// 

import type { Provider as EthereumProvider } from "./inject";

export enum InternalStorageNamespace {
  keyring = "KeyRing",
  persistentEvents = "PersistentEvents",
  domainState = "DomainState",
  evmAccountsState = "EVMAccountsState",
  substrateAccountsState = "SubstrateAccountsState",
  activityState = "ActivityState",
  marketData = "MarketData",
  cacheFetch = "CacheFetch",
  nftState = "NFTState",
  networksState = "NetworksState",
  settingsState = "SettingsState",
  tokensState = "TokensState",
}
// export enum EnkryptProviderEventMethods {
//   persistentEvents = "PersistentEvents",
// }

export type StorageNamespace = InternalStorageNamespace;

export type SendMessageHandler = (
  message: string
) => Promise<any>;

export interface ProviderOptions {
  sendMessageHandler: SendMessageHandler;
}

export abstract class ProviderInterface extends EventEmitter {
  abstract name: string;
  abstract version: string;
  sendMessageHandler: SendMessageHandler;
  constructor(options: ProviderOptions) {
    super();
    this.sendMessageHandler = options.sendMessageHandler;
  }
  abstract handleMessage(msg: string): void;
}

// export abstract class BackgroundProviderInterface extends EventEmitter {
//   middlewares: MiddlewareFunction[] = [];
//   abstract namespace: string;
//   abstract KeyRing: PublicKeyRing;
//   abstract UIRoutes: RoutesType;
//   abstract toWindow: (message: string) => void;
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   constructor(_toWindow: (message: string) => void, options: unknown) {
//     super();
//   }
//   abstract setRequestProvider(network: BaseNetwork): void;
//   abstract request(request: ProviderRPCRequest): Promise<OnMessageResponse>;
//   abstract getUIPath(page: string): string;
//   abstract isPersistentEvent(request: ProviderRPCRequest): Promise<boolean>;
//   abstract sendNotification(notif: string): Promise<void>;
// }

// export abstract class ProviderAPIInterface {
//   abstract node: string;
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
//   constructor(node: string, options?: unknown) { }
//   abstract init(): Promise<void>;
//   abstract getBalance(address: string): Promise<string>;
//   abstract getTransactionStatus(
//     hash: string
//   ): Promise<EthereumRawInfo | SubscanExtrinsicInfo | null>;
// }

export type handleIncomingMessage = (
  provider: Provider,
  message: string
) => void;

export type handleOutgoingMessage = (
  provider: Provider,
  message: string
) => Promise<any>;

export type Provider = EthereumProvider;

export interface ProviderRequestOptions {
  url: string;
  domain: string;
  faviconURL: string;
  title: string;
  tabId: number;
}
export interface ProviderRPCRequest extends RPCRequestType {
  options?: ProviderRequestOptions;
}

// export interface UIExportOptions {
//   routes: RouteRecordRaw[];
// }

// export interface NodeType {
//   name: NetworkNames;
//   name_long: string;
//   homePage: string;
//   blockExplorerTX: string;
//   blockExplorerAddr: string;
//   isTestNetwork: boolean;
//   currencyName: string;
//   icon: any;
//   signer: SignerType[];
//   gradient: string;
//   node: string;
//   displayAddress: (address: string) => string;
//   api?: () => Promise<ProviderAPIInterface>;
//   coingeckoID?: string;
//   NFTHandler?: (network: NodeType, address: string) => Promise<NFTCollection[]>;
//   identicon: (address: string, options?: any) => string;
//   assetsHandler?: (network: NodeType, address: string) => Promise<AssetsType[]>;
//   basePath: string;
// }

// export interface AssetsType {
//   name: string;
//   symbol: string;
//   icon: string;
//   balance: string;
//   balancef: string;
//   balanceUSD: number;
//   balanceUSDf: string;
//   value: string;
//   valuef: string;
//   contract?: string;
//   decimals: number;
//   sparkline: string;
//   priceChangePercentage: number;
//   baseToken?: BaseToken;
// }

export interface ProviderError {
  message: string;
  code: number;
  data?: unknown;
}

export interface EthereumRequest<TParam = any> {
  method: string;
  params?: Array<TParam>;
}

export interface EthereumResponse {
  result?: any;
  error?: ProviderError;
}

export interface JsonRpcRequest {
  id: string;
  jsonrpc: "2.0";
  method: string;
  params?: any[];
}

export interface JsonRpcResponse {
  id: string;
  jsonrpc: "2.0";
  result?: unknown;
  error?: Error;
}

export enum EmitEvent {
  accountsChanged = "accountsChanged",
  chainChanged = "chainChanged",
  connect = "connect",
  disconnect = "disconnect",
  message = "message",
}

export enum MessageMethod {
  changeChainId = "changeChainId",
  changeAddress = "changeAddress",
  changeConnected = "changeConnected",
  subscription = "eth_subscription",
}

export interface ProviderConnectInfo {
  readonly chainId: string;
}

export interface ProviderMessage {
  method: MessageMethod;
  params: Array<any>;
}


export enum EnkryptProviderEventMethods {
  persistentEvents = "PersistentEvents",
}

export type HandleIncomingMessageFunction = (
  provider: Provider,
  message: string
) => void;

export enum ErrorCodes {
  userRejected = 4001,
  unauthorized = 4100,
  unsupportedMethod = 4200,
  disconnected = 4900,
  chainDisconnected = 4901,
}


export interface JSONError {
  error: ProviderError;
}

export interface RPCRequestType {
  method: string;
  params?: Array<any>;
}

export { EthereumProvider };


export interface OnMessageResponse {
  result?: string;
  error?: string;
}

export interface ProviderRequestOptions {
  url: string;
  domain: string;
  faviconURL: string;
  title: string;
  tabId: number;
}
export interface ProviderRPCRequest extends RPCRequestType {
  options?: ProviderRequestOptions;
}

// export abstract class RequestClass extends EventEmitter {
//   url: string;

//   middlewares: MiddlewareFunction[];

//   on: any;

//   off: any;

//   constructor(url: string, middlewares: MiddlewareFunction[]) {
//     super();
//     this.url = url;
//     this.middlewares = middlewares;
//   }

//   abstract changeNetwork(url: string): void;

//   abstract request(req: RPCRequestType): Promise<any>;

//   abstract disconnect(): void;

//   abstract isOpen(): boolean;
// }
