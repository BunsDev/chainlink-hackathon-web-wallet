import { Address, zeroAddress } from 'viem';
import { mainnet, sepolia, polygon } from 'viem/chains';

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
  [polygon.id]: {
    nftRent: '0x3265b195cc42afefcb58297c4e9edbeff6ec05f8',
    smartWalletFactory: '0x4442c3302524899acf23c971afba39710925df77',
  },
} as Record<number, ChainAddresses>;

export const getContractAddresses = (chainId: number) => {
  return contractAddresses[chainId] ?? contractAddresses[sepolia.id];
};
