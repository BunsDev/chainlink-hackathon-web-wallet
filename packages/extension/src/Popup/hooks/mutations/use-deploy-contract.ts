import { useMutation } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { DeployedContractResult } from '../../../lib/providers/background/methods/internal/deployUndasContract';

export const useDeployContract = () => {
  return useMutation({
    mutationFn: async () => {
      const deployTx = await sendRuntimeMessageToBackground<
        EthereumRequest,
        TransactionRequest
      >(
        {
          method: InternalBgMethods.GET_UNDAS_CONTRACT_DEPLOY_TX,
          params: [
            /* should pass args */
          ],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (deployTx.error || !deployTx.result) {
        throw new Error('Failed to get deploy transaction', {
          cause: deployTx.error,
        });
      }

      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<TransactionRequest>,
        DeployedContractResult
      >(
        {
          method: InternalBgMethods.DEPLOY_UNDAS_CONTRACT,
          params: [deployTx.result],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (error || !result) {
        throw new Error('Failed to deploy contract', { cause: error });
      }

      return result;
    },
  });
};
