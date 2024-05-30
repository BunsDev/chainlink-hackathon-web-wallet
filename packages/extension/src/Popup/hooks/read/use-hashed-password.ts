import { useMutation, useQuery } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { DeployedContractResult } from '../../../lib/providers/background/methods/internal/deploySmartWalletContract';

export const useHashedPassword = () => {
  return useQuery({
    queryKey: ['hashed-password'],
    queryFn: async () => {
      const hashedPassword = await sendRuntimeMessageToBackground<
        EthereumRequest,
        string
      >(
        {
          method: InternalBgMethods.GET_HASHED_PASSWORD,
          params: [],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (hashedPassword.error) {
        throw new Error('Failed to fetch hashed password', {
          cause: hashedPassword.error,
        });
      }

      return hashedPassword.result! as string;
    },
  });
};
