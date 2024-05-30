import { BackgroundOnMessageCallback } from '../../../../message-bridge/bridge';
import { RuntimePostMessagePayload } from '../../../../message-bridge/types';
import Storage, { StorageNamespaces } from '../../../../storage';
import { getSessionPassword } from '../../../../storage/common';
import { EthereumRequest } from '../../../types';

export const passwordHash: BackgroundOnMessageCallback<string> = async (
  request: RuntimePostMessagePayload,
  domain: string
) => {
  const commonStorage = new Storage(StorageNamespaces.COMMON);

  return (await commonStorage.get('passwordHash')) as string;
};
