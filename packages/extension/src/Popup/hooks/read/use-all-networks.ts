import { useMutation, useQuery } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { DeployedContractResult } from '../../../lib/providers/background/methods/internal/deploySmartWalletContract';
import { GetAccountsDTO } from '../../../lib/providers/background/methods/internal/getUserAddresses';
import { useMemo } from 'react';
import Browser from 'webextension-polyfill';
import { GetCurrentNetworkDTO } from '../../../lib/providers/background/methods/internal/getCurrentNetwork';

export const useAllNetworks = () => {
  return useQuery({
    queryKey: ['all-networks'],
    queryFn: async () => {
      const allNetworks = await sendRuntimeMessageToBackground<
        EthereumRequest,
        GetCurrentNetworkDTO[]
      >(
        {
          method: InternalBgMethods.GET_ALL_NETWORKS,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (allNetworks.error) {
        throw new Error('Failed to fetch all networks', {
          cause: allNetworks.error,
        });
      }

      const selectedNetwork = allNetworks.result?.find?.((v) => v.isActive);

      return {
        allNetworks: allNetworks.result,
        selectedNetwork,
      };
    },
  });
};
