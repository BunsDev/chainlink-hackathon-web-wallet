import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { EthereumRequest } from '../../../lib/providers/types';
import { InitializeWalletPayloadDTO } from '../../../lib/providers/background/methods/internal/initializeWallet';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { SwitchAccountsRequestPayloadDTO } from '../../../lib/providers/background/methods/internal/switchAccount';
import { SwitchNetworkRequestPayloadDTO } from '../../../lib/providers/background/methods/internal/switchNetwork';

export const useSwitchNetwork = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-networks'] });
      queryClient.invalidateQueries({ queryKey: ['current-network'] });
      queryClient.invalidateQueries({ queryKey: ['user-accounts'] });
    },
    mutationFn: async (params: SwitchNetworkRequestPayloadDTO) => {
      const { result, error } = await sendRuntimeMessageToBackground<
        EthereumRequest<SwitchNetworkRequestPayloadDTO>,
        string
      >(
        {
          method: InternalBgMethods.SWITCH_NETWORK,
          params: [params],
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
