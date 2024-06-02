import { timeout } from '@/helpers/timeout';
import { useQuery } from '@tanstack/react-query';
import { nfts } from '@/mocks/nfts';
import { gql } from '@apollo/client';
import { graphClients } from '@/constants/graph-clients';
import { useClient, useConfig, usePublicClient, useWalletClient } from 'wagmi';
import { readContracts } from '@wagmi/core';
import { ierc721Abi } from '@/abi/IERC721';
import { getAddress } from 'viem';

type GetNfts = {
  metadata: any;
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
  const config = useConfig();

  return useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const result = await Promise.allSettled(
        Object.entries(graphClients).map(async ([chainId, client]) => {
          try {
            const { data } = await client.query<{ lists: GetNfts }>({
              query: QUERY,
            });

            const metadata = await Promise.all(
              data.lists.map(async (list) => {
                const url = new URL(
                  `${process.env.NEXT_PUBLIC_API_URL}/get-nft-metadata`
                );

                const uriRes = await readContracts(config, {
                  contracts: [
                    {
                      abi: ierc721Abi,
                      address: getAddress(list.tokenContract),
                      functionName: 'tokenURI',
                      args: [BigInt(list.tokenId)],
                      chainId: parseInt(chainId),
                    },
                  ],
                });

                if (!uriRes[0].result) throw new Error('Cannot fetch uri');
                url.searchParams.set('tokenContract', list.tokenContract);
                url.searchParams.set('tokenId', list.tokenId);
                url.searchParams.set('tokenURI', uriRes[0].result!);

                const metadata = (await fetch(url).then((res) => res.json()))
                  .data;

                return metadata as {
                  description: string;
                  external_url: string;
                  image: string;
                  name: string;
                };
              })
            );
            return {
              chainId: parseInt(chainId),
              data: data.lists.map((v, i) => ({
                ...v,
                metadata: metadata[i],
              })),
              metadata,
            };
          } catch (error) {
            return null;
          }
        })
      );
      const filtered = result.filter(
        (r) => r.status === 'fulfilled' && r.value !== null
      ) as PromiseFulfilledResult<UseGetNftsReturnType[number]>[];

      return filtered.map((r) => r.value) as UseGetNftsReturnType;
    },
    refetchInterval: 10000,
  });
};
