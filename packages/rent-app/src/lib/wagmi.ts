import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, Chain } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { SUPPORTED_NETWORKS } from '@/constants/chains';

export const config = createConfig({
  chains: SUPPORTED_NETWORKS.map(({ chain }) => chain) as unknown as [
    Chain,
    ...Chain[],
  ],
  transports: SUPPORTED_NETWORKS.reduce(
    (acc, { chain: { id } }) => {
      acc[id] = http();
      return acc;
    },
    {} as Record<number, ReturnType<typeof http>>
  ),
  connectors: [injected({ shimDisconnect: true })],
});
