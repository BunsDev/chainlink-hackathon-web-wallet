import { timeout } from '@/helpers/timeout';
import { useQuery } from '@tanstack/react-query';
import { nfts } from '@/mocks/nfts';

export const useGetNfts = () => {
  return useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      await timeout(1000);
      return nfts;
    },
  });
};
