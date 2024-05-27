import { HDNode } from "ethers/lib/utils";

export const getDeriveAccount = (
    mnemonic: string,
    accountIndex: number
) => {
    const hdNode = HDNode.fromMnemonic(mnemonic);
    return hdNode.derivePath(`m/44'/60'/0'/0/${accountIndex}`);
}