import { graphClients } from '@/constants/graph-clients';
import { gql } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';

export type GetRent = {
  id: string;
  renter: string;
  rentEndsAt: string;
  closed: boolean;
  forceClosed: boolean;
  list: {
    tokenContract: string;
    tokenId: string;
  };
};

export type GetRents = GetRent[];

export type UseGetMyRentsReturnType = (GetRent & { chainId: number })[];

const QUERY = gql`
  query GetRents($address: Bytes!) {
    rents(where: { renter: $address }) {
      id
      renter
      rentEndsAt
      closed
      forceClosed
      list {
        tokenContract
        tokenId
      }
    }
  }
`;

export const useGetMyRents = (address: Address | undefined) => {
  return useQuery({
    queryKey: ['my-rents', address],
    queryFn: async () => {
      if (!address) {
        return [];
      }

      const result = await Promise.allSettled(
        Object.entries(graphClients).flatMap(async ([chainId, client]) => {
          try {
            const { data } = await client.query<{ rents: GetRents }>({
              query: QUERY,
              variables: {
                address,
              },
            });

            const items =
              data.rents?.map((rent) => ({
                ...rent,
                chainId: parseInt(chainId),
              })) ?? [];

            return items;
          } catch (error) {
            return [];
          }
        })
      );

      const filtered = result.filter(
        ({ status }) => status === 'fulfilled'
      ) as PromiseFulfilledResult<UseGetMyRentsReturnType>[];
      return filtered.flatMap(({ value }) => value);
    },
    refetchInterval: 60000,
  });
};
