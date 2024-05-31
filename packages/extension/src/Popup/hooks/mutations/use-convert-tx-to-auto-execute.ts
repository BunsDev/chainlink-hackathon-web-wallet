import { useMutation } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { ConvertTxToAutoExecuteDto } from '../../../lib/providers/background/methods/internal/convertTxToAutoExecute';
import { SendTransactionRequestDTO } from '../../../lib/providers/background/methods/external/eth_sendTransaction';

export const useConvertTxToAutoExecute = () => {
  return useMutation({
    mutationFn: async (tx: ConvertTxToAutoExecuteDto) => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<ConvertTxToAutoExecuteDto>,
        SendTransactionRequestDTO
      >(
        {
          method: InternalBgMethods.CONVERT_TX_TO_AUTO_EXECUTE,
          params: [tx],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (error || !result) {
        throw new Error('Failed to convert', { cause: error });
      }

      return result;
    },
  });
};
