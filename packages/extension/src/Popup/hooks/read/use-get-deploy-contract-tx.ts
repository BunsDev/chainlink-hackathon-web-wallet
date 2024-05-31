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
import { GetDeploySmartWalletContractTxDto } from '../../../lib/providers/background/methods/internal/getDeploySmartWalletContractTx';

export const useGetDeployContract = () => {
  return useQuery({
    queryKey: ['get-deploy-contract'],
    queryFn: async () => {
      const deployTx = await sendRuntimeMessageToBackground<
        EthereumRequest,
        GetDeploySmartWalletContractTxDto
      >(
        {
          method: InternalBgMethods.GET_DEPLOY_SMART_WALLET_CONTRACT,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (deployTx.error) {
        throw new Error('Failed to fetch deploy tx', {
          cause: deployTx.error,
        });
      }

      return {
        deployTx: deployTx.result
      };
    },
  });
};
