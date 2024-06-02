import { Chain, mainnet, sepolia } from 'wagmi/chains';
import eth from '../assets/img/icons/eth.svg';

export interface Network {
  chain: Chain;
  icon: any;
  moralisId: string;
}

export const SUPPORTED_NETWORKS: Network[] = [
  { chain: sepolia, icon: eth, moralisId: 'sepolia' },
  { chain: mainnet, icon: eth, moralisId: 'eth' },
];
