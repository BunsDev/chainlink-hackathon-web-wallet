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

export const useUserAccounts = () => {
  return useQuery({
    queryKey: ['user-accounts'],
    queryFn: async () => {
      const [currentTab] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const userAccounts = await sendRuntimeMessageToBackground<
        EthereumRequest<string>,
        GetAccountsDTO[]
      >(
        {
          method: InternalBgMethods.GET_USER_ADDRESSES,
          params: [currentTab.url!],
        },
        RuntimePostMessagePayloadType.INTERNAL
      );

      if (userAccounts.error) {
        throw new Error('Failed to fetch user accounts', {
          cause: userAccounts.error,
        });
      }

      // FIXME!!
      const selectedAccount = userAccounts.result?.find?.((v) => v.isActive);

      // FIXME!!
      const selectedAccountSmartWallets = userAccounts.result?.find?.(
        (v) => v?.masterWallet === selectedAccount?.address
      );

      return {
        accounts: userAccounts.result!,
        selectedAccount,
        selectedAccountSmartWallets,
      };
    },
  });
};
