import { timeout } from '@/helpers/timeout';
import { useQuery } from '@tanstack/react-query';
import { hotNfts } from '@/mocks/nfts';
import { Address, Hex, parseUnits } from 'viem';
import { MoralisResult } from '@/pages/api/get-nfts';
import { useAccount, useReadContract, useSimulateContract } from 'wagmi';
import { uniswapV3Quoter } from '@/abi/UniswapV3Quoter';

type Info = {
  nativeToLinkPath: Hex;
  uniV3Quoter: Hex;
  linkFee: bigint;
};

const swapInfoPerNetwork: Record<number, Info> = {
  11155111: {
    nativeToLinkPath:
      '0x779877a7b0d9e8603169ddbd7836e478b4624789000bb8fff9976782d46cc05630d1f6ebab18b2324d6b14',
    uniV3Quoter: '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3',
    linkFee: parseUnits('7', 18),
  },
};

export const useRequiredNativeRent = () => {
  const { chainId } = useAccount();

  // if(!chainId) return BigInt(0);
  const info = chainId ? swapInfoPerNetwork[chainId!] : undefined;
  // if (!info) return BigInt(0);

  const { data } = useSimulateContract({
    address: info?.uniV3Quoter!,
    abi: uniswapV3Quoter,
    functionName: 'quoteExactOutput',
    args: [info?.nativeToLinkPath!, info?.linkFee!],
  });

  console.log({ data: data?.result });

  if (!data || !data.result) return BigInt(0);

  return data.result[0] + data.result[0] / BigInt(10);
};
