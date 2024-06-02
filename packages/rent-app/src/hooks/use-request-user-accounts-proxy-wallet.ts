import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAccount, useClient } from 'wagmi';

export const useRequestUserAccountsProxyWallet = () => {
  const client = useClient();
  const { address } = useAccount();
  return useQuery({
    queryKey: ['user-wallet-accounts', address],
    queryFn: async () => {
      console.log('wallet_requestAccounts before');

      const response = await client?.request({
        method: 'wallet_requestAccounts',
        params: [],
      } as any,);

      console.log('wallet_requestAccounts', { response });

      return response
    },
  });
};
