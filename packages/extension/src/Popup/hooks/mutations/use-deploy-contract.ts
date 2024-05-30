import { useMutation } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { DeployedContractResult } from '../../../lib/providers/background/methods/internal/deploySmartWalletContract';

export const useDeployContract = () => {
  return useMutation({
    mutationFn: async () => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest,
        DeployedContractResult
      >(
        {
          method: InternalBgMethods.DEPLOY_SMART_WALLET_CONTRACT,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (error || !result) {
        throw new Error('Failed to deploy contract', {cause: error });
      }

      return result;
    },
  });
};
