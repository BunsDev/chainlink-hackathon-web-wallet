import { ethers } from 'ethers';
import { getCustomError } from '../errors';
import { BackgroundOnMessageCallback } from '../message-bridge/bridge';
import {
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../message-bridge/types';
import { EthereumRequest, JsonRpcRequest } from '../providers/types';
import Storage, { StorageNamespaces } from '../storage';

export const makeRpcRequest: BackgroundOnMessageCallback<
  unknown,
  EthereumRequest
> = async (request) => {
  const req = request.msg;

  if (!req) {
    throw getCustomError('ethRequestAccounts: invalid data');
  }

  const curNetwork = await getCurrentNetwork();
  const res = await curNetwork.rpcProvider.send(req.method, req.params ?? []);
  console.log('rpc req result', res);
  return res;
};

export const getCurrentNetwork = async () => {
  const storageCommon = new Storage(StorageNamespaces.COMMON);
  let selectedNetwork = await storageCommon.get<string>('selectedNetwork');

  if (!selectedNetwork) {
    const defaultNetwork = getDefaultNetwork();
    selectedNetwork = defaultNetwork.name;
    await storageCommon.set('selectedNetwork', defaultNetwork.name);
  }

  return getSupportedNetworks().find((v) => v.name === selectedNetwork)!;
};

export const getDefaultNetwork = () => {
  return getNetwork('Sepolia')!;
};
export const getNetwork = (name: string) => {
  return getSupportedNetworks().find((v) => v.name === name);
};
export const getSupportedNetworks = () => {
  // todo: take this from local storage
  const networkConfig = [
    {
      jsonRpcUrl:
        'https://sepolia.infura.io/v3/44aadb4903f8450dba123bf5d29a8587',
      chainId: 11155111,
      name: 'Sepolia',
      nativeName: 'Sepolia Ether',
      nativeSymbol: 'SEP ETH',
    },
    {
      jsonRpcUrl:
        'https://mainnet.infura.io/v3/44aadb4903f8450dba123bf5d29a8587',
      chainId: 1,
      name: 'Ethereum',
      nativeName: 'Ether',
      nativeSymbol: 'ETH',
    },
  ];
  return networkConfig.map((v) => ({
    ...v,
    rpcProvider: new ethers.providers.JsonRpcProvider(v.jsonRpcUrl, v.chainId),
  }));
};
