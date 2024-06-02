import { BigNumber, ContractFactory, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
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
import { EthereumRequest, EthereumRequestOverrideParams } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { getCurrentNetwork } from '../../../../requests/toRpcNode';
import {
  SmartWalletFactoryV1__factory,
  SmartWalletV1__factory,
} from '../../../../../typechain';
import { hash } from '../../../../utils/crypto';
import { SendTransactionRequestDTO } from '../external/eth_sendTransaction';
import { getActiveAccountForSite } from '../../helpers';
import { Hex, parseUnits } from 'viem';

export type ConvertTxToAutoExecuteDto = TransactionRequest & {
  executeAfter: number;
};

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
  137: {
    nativeToLinkPath:
      '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39000bb80d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    uniV3Quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    linkFee: parseUnits('2', 18),
  },
};


export const convertTxToAutoExecute: BackgroundOnMessageCallback<
  ConvertTxToAutoExecuteDto,
  EthereumRequest<ConvertTxToAutoExecuteDto>
> = async (request, origin) => {
  const payload = request.msg;
  const domain = getBaseUrl(origin);

  if (!payload || !payload.params || !payload.params.length) {
    throw getCustomError('convertTxToAutoExecute: invalid data');
  }

  const [txRequest] = payload.params;

  const storageAddresses = new Storage(StorageNamespaces.USER_WALLETS);

  if (!domain) {
    throw getCustomError('ethRequestAccounts: invalid sender origin');
  }

  const accounts = await storageAddresses.get<UserAccount[]>('accounts');

  const userSelectedAccount = await getActiveAccountForSite(domain);

  if (!userSelectedAccount) {
    throw getCustomError('ethRequestAccounts: user selected address is null');
  }

  const { rpcProvider } = await getCurrentNetwork();

  const isSmartAccount = !!userSelectedAccount.masterAccount;

  if (!isSmartAccount) {
    throw new Error('Cannot auto execute from EOA');
  }

  const masterWalletAccount = isSmartAccount
    ? accounts?.find(
        (v) =>
          getAddress(v.address) ===
          getAddress(userSelectedAccount.masterAccount!)
      )
    : null;

  if (masterWalletAccount === undefined) {
    throw new Error('Master account is not found');
  }

  txRequest.from = userSelectedAccount.masterAccount!;

  const walletContract = SmartWalletV1__factory.connect(
    userSelectedAccount.address,
    rpcProvider
  );

  if (!txRequest.to) throw getCustomError('missing argument');

  const randomSeed = hash(new Date().getTime().toString());

  const salt = ethers.utils.solidityKeccak256(['string'], [randomSeed]);

  const originalData = walletContract.interface.decodeFunctionData(
    'execute',
    txRequest.data!
  );

  const populatedTx = await walletContract.populateTransaction.addToAutoExecute(
    salt,
    ethers.constants.AddressZero,
    originalData.data ?? '0x',
    originalData.to,
    originalData.callValue ?? '0',
    txRequest.executeAfter
  );

  txRequest.data = populatedTx.data ?? '0x';
  txRequest.to = populatedTx.to;

  txRequest.gasLimit = await rpcProvider.estimateGas(txRequest).catch((err) => {
    return BigNumber.from(5_000_000);
  });

  let tx = txRequest;

  delete (tx as any).gas;

  delete tx.maxFeePerGas;
  delete tx.maxPriorityFeePerGas;

  return tx;
};
