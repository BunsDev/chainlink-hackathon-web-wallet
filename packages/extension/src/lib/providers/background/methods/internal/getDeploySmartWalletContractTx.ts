import { BigNumber, ContractFactory, ethers } from 'ethers';
import { formatUnits, getAddress, parseUnits } from 'ethers/lib/utils';
import { TestGameContract__factory } from '../../../../../Popup/testContractFactory/TestGameContract__factory';
import { Wallet__factory } from '../../../../../Popup/testContractFactory/Wallet__factory';
import { getCustomError } from '../../../../errors';
import {
  BackgroundOnMessageCallback,
  sendMessageFromBackgroundToBackground,
} from '../../../../message-bridge/bridge';
import {
  PostMessageDestination,
  RuntimePostMessagePayload,
  RuntimePostMessagePayloadType,
} from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import { SmartWalletFactoryV1__factory } from '../../../../../typechain';
import { hash } from '../../../../utils/crypto';
import { SendTransactionRequestDTO } from '../external/eth_sendTransaction';
import { getActiveAccountForSite } from '../../helpers';

// TODO: move to shared constants
const factoryAddresses: Record<number, string> = {
  11155111: '0x7d1F8B741116546911B725E23f96E508fBd4a04E',
};

export type GetDeploySmartWalletContractTxDto = SendTransactionRequestDTO & {
  address: string;
  salt: string;
};

export const getDeploySmartWalletContractTx: BackgroundOnMessageCallback<
  GetDeploySmartWalletContractTxDto,
  EthereumRequest
> = async (req, domain) => {
  console.log('getDeploySmartWalletContractTx');

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const selectedAccount = await getActiveAccountForSite(domain);

  if (!selectedAccount) throw getCustomError('Selected addresses is null');

  if (!!selectedAccount.masterAccount) {
    throw getCustomError('Selected account should be EOA');
  }

  const accounts = await storageWallets.get<UserAccount[]>('accounts');

  if (!accounts || !accounts.length) throw getCustomError('Accounts is null');

  const { rpcProvider, chainId } = await getCurrentNetwork();

  const factoryAddress = factoryAddresses[chainId];

  if (!factoryAddress) {
    throw new Error('Network is not supported');
  }

  const factory = SmartWalletFactoryV1__factory.connect(
    factoryAddress,
    rpcProvider
  );

  const randomSeed = hash(new Date().getTime().toString());

  const salt = ethers.utils.solidityKeccak256(
    ['address', 'string'],
    [selectedAccount.address, randomSeed]
  );

  const deployTx = await factory.populateTransaction.create2Wallet(
    selectedAccount.address,
    selectedAccount.address,
    salt
  );
  deployTx.from = selectedAccount.address;

  deployTx.gasLimit = await factory.estimateGas
    .create2Wallet(selectedAccount.address, selectedAccount.address, salt)
    .catch((_) => BigNumber.from(100_000));

  deployTx.gasPrice = await factory.provider.getGasPrice();

  const deploymentAddress = await factory.predictCreate2Wallet(
    selectedAccount.address,
    salt
  );

  return {
    ...deployTx,
    salt,
    isContractWalletDeployment: true,
    address: deploymentAddress,
    totalCost: +formatUnits(
      BigNumber.from(deployTx.gasPrice!).mul(deployTx.gasLimit!)
    ),
  };
};
