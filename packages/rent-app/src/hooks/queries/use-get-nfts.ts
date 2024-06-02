import { timeout } from '@/helpers/timeout';
import { useQuery } from '@tanstack/react-query';
import { nfts } from '@/mocks/nfts';
import { gql } from '@apollo/client';
import { graphClients } from '@/constants/graph-clients';

type GetNfts = {
  lists: {
    id: string;
    owner: string;
    tokenContract: string;
    tokenId: string;
    rentDuration: string;
    ethFee: string;
    fulfilled: boolean;
    rentedBy: {
      id: string;
      renter: string;
      rentEndsAt: string;
      closed: boolean;
      forceClosed: boolean;
    } | null;
  }[];
};

const QUERY = gql`
  query GetNfts {
    lists(where: { fulfilled: false }) {
      id
      owner
      tokenContract
      tokenId
      rentDuration
      ethFee
      fulfilled
      rentedBy {
        id
        renter
        rentEndsAt
        closed
        forceClosed
      }
    }
  }
`;

export type UseGetNftsReturnType = {
  chainId: number;
  data: GetNfts;
}[];
export const useGetNfts = () => {
  return useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const result = await Promise.allSettled(
        Object.entries(graphClients).map(async ([chainId, client]) => {
          try {
            const { data } = await client.query<GetNfts>({ query: QUERY });
            return { chainId: parseInt(chainId), data };
          } catch (error) {
            console.error(error);
            return null;
          }
        })
      );
      const filtered = result.filter(
        (r) => r.status === 'fulfilled' && r.value !== null
      ) as PromiseFulfilledResult<UseGetNftsReturnType[number]>[];

      return filtered.map((r) => r.value) as UseGetNftsReturnType;
    },
  });
};
