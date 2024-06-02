import { useQuery } from '@tanstack/react-query';
import { Address, erc721Abi, getAddress } from 'viem';
import { MoralisResult } from '@/pages/api/get-nfts';
import { useConfig } from 'wagmi';
import { readContracts } from '@wagmi/core';

interface UseGetMyNftsReturnType {
  data: MoralisResult<{ chainId: number }>[];
}

export const useGetMyNfts = (address: Address | undefined) => {
  const config = useConfig();

  return useQuery({
    queryKey: ['my-nfts', address],
    queryFn: async () => {
      if (!address) {
        return [];
      }
      const response = (await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/get-nfts?address=${address}`
      ).then((res) => res.json())) as UseGetMyNftsReturnType;

      const newData = await Promise.all(
        response.data.map(async (v) => {
          const url = new URL(
            `${process.env.NEXT_PUBLIC_API_URL}/get-nft-metadata`
          );
          const uriRes = await readContracts(config, {
            contracts: [
              {
                abi: erc721Abi,
                address: getAddress(v.token_address),
                functionName: 'tokenURI',
                args: [BigInt(v.token_id)],
                chainId: v.chainId,
              },
            ],
          });

          if (!uriRes[0].result) throw new Error('Cannot fetch uri');
          url.searchParams.set('tokenContract', v.token_address);
          url.searchParams.set('tokenId', v.token_id);
          url.searchParams.set('tokenURI', uriRes[0].result!);

          const metadata = (await fetch(url).then((res) => res.json())).data;

          return {
            ...v,
            normalized_metadata: metadata,
          };
        })
      );

      return newData;
    },
    refetchInterval: 60000,
  });
};
