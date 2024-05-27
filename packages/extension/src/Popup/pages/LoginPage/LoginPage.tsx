import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendRuntimeMessageToBackground } from '../../../lib/message-bridge/bridge';
import { RuntimePostMessagePayloadType } from '../../../lib/message-bridge/types';
import { InternalBgMethods } from '../../../lib/message-handlers/background-message-handler';
import { InitializeWalletPayloadDTO } from '../../../lib/providers/background/methods/internal/initializeWallet';
import { EthereumRequest } from '../../../lib/providers/types';

import { Context } from '../../Context';
// import { createPasswordForMnemonic } from '../../storageUtils/utils';

const LoginPage = (props: any) => {
  const [mnemonicPhrase, setMnemonicPhrase] = useState<any>();
  const [password, setPassword] = useState<any>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { loggedIn, setLoggedIn } = useContext<any>(Context);

  const initializeWallet = async () => {
    if (!mnemonicPhrase || !password) alert('missing argument');
    if (!validatePassword(password)) alert('bad password');
    setIsLoading(true);
    const result =
      await sendRuntimeMessageToBackground<EthereumRequest<InitializeWalletPayloadDTO>, string>({
        method: InternalBgMethods.INITIALIZE_WALLET,
        params: [{
          mnemonic: mnemonicPhrase,
          walletPassword: password
        }]
      }, RuntimePostMessagePayloadType.INTERNAL)
    setIsLoading(false);
    alert(`Current active address: ${result.result}`)
    setLoggedIn(!loggedIn);
    navigate('/')
  }

  const validatePassword = async (password: string) => {
    // todo 
    return true;
  }

  return (
    <div className="flex flex-col w-2/5">
      <div>
        <h2>Login with mnemonic</h2>
        <input
          type="text"
          placeholder="Mnemonic"
          className="bg-blue-500"
          onChange={(e) => setMnemonicPhrase(e.target.value)}
        />
        <input
          type="text"
          placeholder="Create Password"
          className="bg-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => initializeWallet()}
        >
          Login
        </button>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/create-wallet')}
        >
          Create new
        </button>
      </div>
      {isLoading && <div>
        Loading
      </div>}
    </div>
  );
};

export default LoginPage;
