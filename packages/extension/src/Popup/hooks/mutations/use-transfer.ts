import { useMutation } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { EthereumRequest } from '../../../lib/providers/types';
import { utils } from 'ethers';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { SendTransactionRequestDTO } from '../../../lib/providers/background/methods/external/eth_sendTransaction';

export interface UseTransferParams {
  address: string;
  amount: number;
}

export const useTransfer = () => {
  return useMutation({
    mutationFn: async (params: UseTransferParams) => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<SendTransactionRequestDTO>,
        string
      >(
        {
          method: 'eth_sendTransaction',
          params: [
            {
              to: params.address,
              value: utils.parseEther(params.amount.toString()),
            },
          ],
        },
        RuntimePostMessagePayloadType.EXTERNAL
      );

      if (error) {
        throw error;
      }

      return result;
    },
  });
};
