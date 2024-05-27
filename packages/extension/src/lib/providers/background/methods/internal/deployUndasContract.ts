import { ContractFactory, ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { TestGameContract__factory } from '../../../../../Popup/testContractFactory/TestGameContract__factory';
import { Wallet__factory } from '../../../../../Popup/testContractFactory/Wallet__factory';
import { getCustomError } from '../../../../errors';
import { BackgroundOnMessageCallback, sendMessageFromBackgroundToBackground } from '../../../../message-bridge/bridge';
import { PostMessageDestination, RuntimePostMessagePayload, RuntimePostMessagePayloadType } from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getBaseUrl } from '../../../../utils/url';
import { EthereumRequest } from '../../../types';
import { UserAccount, UserSelectedAccount } from './initializeWallet';
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { getCurrentNetwork } from '../../../../requests/toRpcNode';

export type DeployedContractResult = {
  address: string;
  txHash: string
}

export const deployUndasContract: BackgroundOnMessageCallback<DeployedContractResult, EthereumRequest<TransactionRequest>> = async (req, domain) => {
  console.log('deployUndasContract');

  // TODO: move invalid payload error to predefined errors
  if (!req.msg || !req.msg.params || !req.msg.params.length) throw getCustomError('Invalid payload')
  const [tx] = req.msg?.params;

  const storageWallets = new Storage(StorageNamespaces.USER_WALLETS);

  const selectedAccount = await storageWallets.get<UserSelectedAccount>(
    'selectedAccount'
  );

  if(!selectedAccount) throw getCustomError('Selected addresses is null');
  
  const accounts = await storageWallets.get<UserAccount[]>('accounts');

  if(!accounts || !accounts.length) throw getCustomError('Accounts is null');

  const { rpcProvider } = await getCurrentNetwork();


  const nonce = tx.nonce ?? await rpcProvider.getTransactionCount(selectedAccount.address ?? "", 'pending');

  console.log({nonce})
  const anticipatedAddress = ethers.utils.getContractAddress({
    from: selectedAccount.address,
    nonce,
  });

  console.log('Anticipated address', anticipatedAddress);
  console.log('Tx request', tx);

  const txHash = await sendMessageFromBackgroundToBackground<string>({
    method: 'eth_sendTransaction',
    params: [tx]
  } as EthereumRequest<TransactionRequest>,
    RuntimePostMessagePayloadType.EXTERNAL,
    domain,
    true
  )

  const result:DeployedContractResult =  {
    address: anticipatedAddress,
    txHash
  };

  console.log('DEPLOY CONTRACT RESULT:', result);


  // TODO: wait for tx and save to storage only if it succeed
  selectedAccount.undasContract = result.address;

  accounts.map((address: any) => {
    console.log('qwe', address)
    if (address.address == selectedAccount.address) {
      address.undasContract = result.address;
    }
  });

  await storageWallets.set('selectedAccount', selectedAccount);
  await storageWallets.set('accounts', accounts);

  return result;
};
