import { Wallet } from 'ethers';
import { create } from 'zustand';

interface MnemonicStore {
  mnemonic: string;
  createRandom: () => void;
  setMnemonic: (mnemonic: string) => void;
}

export const useMnemonic = create<MnemonicStore>((set) => ({
  mnemonic: '',
  createRandom: () => set({ mnemonic: Wallet.createRandom().mnemonic.phrase }),
  setMnemonic: (mnemonic) => set({ mnemonic }),
}));
