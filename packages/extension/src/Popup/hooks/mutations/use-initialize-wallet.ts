import { useMutation } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { InitializeWalletPayloadDTO } from '../../../lib/providers/background/methods/internal/initializeWallet';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';

export interface UseInitializeWalletParams {
  mnemonic: string;
  walletPassword: string;
}

export const useInitializeWallet = () => {
  return useMutation({
    mutationFn: async (params: UseInitializeWalletParams) => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<InitializeWalletPayloadDTO>,
        string
      >(
        {
          method: InternalBgMethods.INITIALIZE_WALLET,
          params: [params],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (error || !result) {
        throw error;
      }

      return result;
    },
  });
};
