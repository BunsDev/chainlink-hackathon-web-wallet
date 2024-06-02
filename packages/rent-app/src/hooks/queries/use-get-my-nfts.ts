import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { MoralisResult } from '@/pages/api/get-nfts';

interface UseGetMyNftsReturnType {
  data: MoralisResult<{ chainId: number }>[];
}

export const useGetMyNfts = (address: Address | undefined) => {
  return useQuery({
    queryKey: ['my-nfts', address],
    queryFn: async () => {
      if (!address) {
        return [];
      }
      const response = (await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-nfts?address=${address}`
      ).then((res) => res.json())) as UseGetMyNftsReturnType;
      return response.data;
    },
    refetchInterval: 60000,
  });
};
