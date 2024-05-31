import { assert } from 'chai';
import Browser from 'webextension-polyfill';
import { getCustomError } from '../errors';
import { BackgroundOnMessageCallback } from '../message-bridge/bridge';
import {
  RuntimeOnMessageResponse,
  RuntimePostMessagePayloadType,
} from '../message-bridge/types';
import { ethCall } from '../providers/background/methods/external/eth_call';
import { ethRequestAccounts } from '../providers/background/methods/external/eth_requestAccounts';
import { ethSendTransaction } from '../providers/background/methods/external/eth_sendTransaction';
import { ethSendRawTransaction } from '../providers/background/methods/external/eth_sendRawTransaction';
import { isLocked } from '../providers/background/methods/internal/isLocked';
import { connectAccount } from '../providers/background/methods/internal/connectAccount';
import { deploySmartWalletContract } from '../providers/background/methods/internal/deploySmartWalletContract';
import { disconnectAccount } from '../providers/background/methods/internal/disconnectAccount';
import { getUserAddresses } from '../providers/background/methods/internal/getUserAddresses';
import { initializeWallet } from '../providers/background/methods/internal/initializeWallet';
import { isWalletInitialized } from '../providers/background/methods/internal/isWalletInitialized';
import { switchAccount } from '../providers/background/methods/internal/switchAccount';
import {
  EthereumRequest,
  EthereumRequestOverrideParams,
} from '../providers/types';
import { makeRpcRequest } from '../requests/toRpcNode';
import { walletRequestAccounts } from '../providers/background/methods/external/wallet_requestAccounts';
import { passwordHash } from '../providers/background/methods/internal/passwordHash';
import { getCurrentNetwork } from '../providers/background/methods/internal/getCurrentNetwork';
import { switchNetwork } from '../providers/background/methods/internal/switchNetwork';
import { getAllNetworks } from '../providers/background/methods/internal/getAllNetworks';
import { ethSignTypedDataV4 } from '../providers/background/methods/external/eth_signTypedData_v4';

export enum InternalBgMethods {
  IS_LOCKED = 'isLocked',
  GET_HASHED_PASSWORD = 'getHashedPassword',
  IS_WALLET_INITIALIZED = 'isWalletInitialized',
  INITIALIZE_WALLET = 'initializeWallet',
  GET_USER_ADDRESSES = 'getUserAddresses',
  DEPLOY_SMART_WALLET_CONTRACT = 'deploySmartWalletContract',
  SWITCH_ACCOUNT = 'switchAccount',
  DISCONNECT_ACCOUNT = 'disconnectAccount',
  CONNECT_ACCOUNT = 'connectAccount',
  IMPORT_CONTRACT = 'importContract',
  GET_CURRENT_NETWORK = 'getCurrentNetwork',
  SWITCH_NETWORK = 'switchNetwork',
  GET_ALL_NETWORKS = 'getAllNetworks',
}

export const handleBackgroundMessage: BackgroundOnMessageCallback = async (
  request,
  domain
) => {
  console.log('BG sender', domain);

  if (request.type === RuntimePostMessagePayloadType.EXTERNAL) {
    console.log('external', domain);

    return await handleExternal(request, domain);
  } else {
    console.log('internal', domain);

    return await handleInternal(request, domain);
  }
};

const handleExternal: BackgroundOnMessageCallback<
  any,
  EthereumRequestOverrideParams
> = async (request, domain) => {
  if (!request.msg) throw getCustomError('Invalid payload');

  console.log('bg: handleExternal');

  if (
    request.msg.method == 'eth_accounts' ||
    request.msg.method == 'eth_requestAccounts' ||
    request.msg.method == 'eth_coinbase'
  ) {
    return ethRequestAccounts(request, domain);
  } else if (request.msg.method === 'wallet_requestAccounts') {
    return walletRequestAccounts(request, domain);
  } else if (request.msg.method === 'eth_sendTransaction') {
    return ethSendTransaction(request, domain);
  } else if (request.msg.method === 'eth_sendRawTransaction') {
    return ethSendRawTransaction(request, domain);
  } else if (request.msg.method === 'eth_signTypedData_v4') {
    return ethSignTypedDataV4(request, domain);
  } else if (request.msg.method === 'eth_call') {
    return ethCall(request, domain);
  } else {
    console.log('making direct rpc request');
    return makeRpcRequest(request, domain);
  }
};

const handleInternal: BackgroundOnMessageCallback<
  any,
  EthereumRequest
> = async (request, domain) => {
  if (!request.msg) throw getCustomError('Invalid payload');

  console.log('bg: handleInternal req', request);

  if (request.msg.method === InternalBgMethods.IS_LOCKED) {
    return isLocked(request, domain);
  } else if (request.msg.method === InternalBgMethods.INITIALIZE_WALLET) {
    return initializeWallet(request, domain);
  } else if (request.msg.method === InternalBgMethods.IS_WALLET_INITIALIZED) {
    return isWalletInitialized(request, domain);
  } else if (request.msg.method === InternalBgMethods.GET_USER_ADDRESSES) {
    return getUserAddresses(request, domain);
  } else if (
    request.msg.method === InternalBgMethods.DEPLOY_SMART_WALLET_CONTRACT
  ) {
    return deploySmartWalletContract(request, domain);
  } else if (request.msg.method === InternalBgMethods.SWITCH_ACCOUNT) {
    return switchAccount(request, domain);
  } else if (request.msg.method === InternalBgMethods.DISCONNECT_ACCOUNT) {
    return disconnectAccount(request, domain);
  } else if (request.msg.method === InternalBgMethods.CONNECT_ACCOUNT) {
    return connectAccount(request, domain);
  } else if (request.msg.method === InternalBgMethods.GET_HASHED_PASSWORD) {
    return passwordHash(request, domain);
  } else if (request.msg.method === InternalBgMethods.GET_CURRENT_NETWORK) {
    return getCurrentNetwork(request, domain);
  } else if (request.msg.method === InternalBgMethods.SWITCH_NETWORK) {
    return switchNetwork(request, domain);
  } else if (request.msg.method === InternalBgMethods.GET_ALL_NETWORKS) {
    return getAllNetworks(request, domain);
  } else {
    console.log('bg: internal unknown method');
    throw getCustomError('Invalid background method');
  }
};
