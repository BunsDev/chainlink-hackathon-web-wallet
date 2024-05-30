import { timeout } from '@/helpers/timeout';
import { useQuery } from '@tanstack/react-query';
import { hotNfts } from '@/mocks/nfts';

export const useGetHotNfts = () => {
  return useQuery({
    queryKey: ['hot-nfts'],
    queryFn: async () => {
      await timeout(1000);
      return hotNfts;
    },
  });
};
