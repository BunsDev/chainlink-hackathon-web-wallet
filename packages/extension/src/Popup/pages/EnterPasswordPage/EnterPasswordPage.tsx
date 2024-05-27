import { ethers } from 'ethers';
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../Context';
import { decryptPrivatKeyViaPassword } from '../../storageUtils/utils';

const EnterPasswordPage = (props: any) => {
  const { loggedIn, setLoggedIn, signer, setSigner } = useContext<any>(Context);
  const [password, setPassword] = useState<string>();
  const navigate = useNavigate();

  function createSigner(accountPrivateKey: any) {
    const alchemyProvider = new ethers.providers.AlchemyProvider( //move to .env
      'goerli',
      'oddBTGV5Pb8AW_EWk7CJSSDxTwjfUlE9'
    );
    const newSigner = new ethers.Wallet(accountPrivateKey, alchemyProvider);
    setSigner(newSigner);
  }

  async function decrypt() {
    const pk = await decryptPrivatKeyViaPassword(password);
    createSigner(pk);
    setLoggedIn(!loggedIn);
  }

  return (
    <div className="flex flex-col w-2/5">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="enter password page"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => decrypt()}
      >
        LogIn
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('/create-wallet')}
      >
        Create new
      </button>
    </div>
  );
};

export default EnterPasswordPage;
