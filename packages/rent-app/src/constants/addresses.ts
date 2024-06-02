import { Address, zeroAddress } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

type ChainAddresses = {
  nftRent: Address;
  smartWalletFactory: Address;
};

export const contractAddresses = {
  [sepolia.id]: {
    nftRent: '0x462b63a99F68B14681518a1E12F15119a5581465',
    smartWalletFactory: '0x690463957Af8ac5bCDf2fac6a433E116774E5E61',
  },
  [mainnet.id]: {
    nftRent: zeroAddress,
    smartWalletFactory: zeroAddress,
  },
} as Record<number, ChainAddresses>;

export const getContractAddresses = (chainId: number) => {
  return contractAddresses[chainId] ?? contractAddresses[sepolia.id];
};
