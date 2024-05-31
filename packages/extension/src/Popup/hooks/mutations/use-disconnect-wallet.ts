import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { InitializeWalletPayloadDTO } from '../../../lib/providers/background/methods/internal/initializeWallet';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { SwitchAccountsRequestPayloadDTO } from '../../../lib/providers/background/methods/internal/switchAccount';

export const useDisconnectWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
    },
    mutationFn: async (account: string) => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<string>,
        void
      >(
        {
          method: InternalBgMethods.DISCONNECT_ACCOUNT,
          params: [account],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (error) {
        throw error;
      }

      return result;
    },
  });
};
