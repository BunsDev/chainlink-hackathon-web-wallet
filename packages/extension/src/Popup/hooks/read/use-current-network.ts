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

export const useCurrentNetwork = () => {
  return useQuery({
    queryKey: ['current-network'],
    queryFn: async () => {
      const currentNetwork = await sendRuntimeMessageToBackground<
        EthereumRequest,
        GetCurrentNetworkDTO
      >(
        {
          method: InternalBgMethods.GET_CURRENT_NETWORK,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (currentNetwork.error) {
        throw new Error('Failed to fetch user accounts', {
          cause: currentNetwork.error,
        });
      }

      return currentNetwork.result;
    },
  });
};
