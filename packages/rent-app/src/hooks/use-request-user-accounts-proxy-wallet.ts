import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Address } from 'viem';
import {
  useAccount,
  UseAccountReturnType,
  useClient,
  useWalletClient,
} from 'wagmi';

export const useRequestUserAccountsProxyWallet = () => {
  const { data: walletClient } = useWalletClient();
  const useAccountData = useAccount();

  const res = useQuery({
    queryKey: ['user-wallet-accounts', useAccountData?.address],

    queryFn: async () => {
      if (!walletClient) return;
      const proxyWalletClient = walletClient.extend((client) => ({
        async walletRequestAccounts() {
          return (await client.request({
            // @ts-ignore
            method: 'wallet_requestAccounts',
            // @ts-ignore
            params: [],
          })) as {
            address: Address;
            isSmartWallet: string;
            swartWalletVersion: string;
          }[];
        },
      }));

      const res = await proxyWalletClient.walletRequestAccounts();
      const acc = res.length ? res[0] : undefined;

      return {
        isSmartWallet: acc?.isSmartWallet === 'true',
        ...useAccountData,
      };
    },
  });

  useEffect(() => {
    res.refetch();
  }, [useAccountData]);

  return (res.data ? res.data : useAccountData) as UseAccountReturnType & {
    isSmartWallet: boolean | undefined;
  };
};
