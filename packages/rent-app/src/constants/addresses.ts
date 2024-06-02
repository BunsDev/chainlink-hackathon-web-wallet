import { Address, zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

type ChainAddresses = {
  nftRent: Address;
  smartWalletFactory: Address;
};

export const contractAddresses = {
  [sepolia.id]: {
    nftRent: '0x95ed3F57E77E6734477f3C9674b8F6c8c70B128D',
    smartWalletFactory: '0xbE8DeE7Ec4A36CDF5b3471BC7Fe4ba3d1331e8e2',
  },
  [mainnet.id]: {
    nftRent: zeroAddress,
    smartWalletFactory: zeroAddress,
  },
} as Record<number, ChainAddresses>;

export const getContractAddresses = (chainId: number) => {
  return contractAddresses[chainId] ?? contractAddresses[sepolia.id];
};
