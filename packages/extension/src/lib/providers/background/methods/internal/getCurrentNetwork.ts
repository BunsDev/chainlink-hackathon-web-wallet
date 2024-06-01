import { formatUnits, getAddress } from 'ethers/lib/utils';
import { getCustomError } from '../../../../errors';
import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { getCurrentNetwork as getCurrentNetworkRpc } from '../../../../requests/toRpcNode';

export type GetCurrentNetworkDTO = {
  name: string;
  chainId: number;
  nativeSymbol: string;
  nativeName: string;
  isActive: boolean;
  image: any;
};

export const getCurrentNetwork: BackgroundOnMessageCallback<
  GetCurrentNetworkDTO,
  EthereumRequest<string>
> = async (payload, _) => {
  if (!payload.msg || !payload.msg.params) {
    throw getCustomError('Invalid payload');
  }

  const network = await getCurrentNetworkRpc();

  return {
    chainId: network.chainId,
    name: network.name,
    nativeName: network.nativeName,
    nativeSymbol: network.nativeSymbol,
    image: network.image,
    isActive: true,
  };
};
