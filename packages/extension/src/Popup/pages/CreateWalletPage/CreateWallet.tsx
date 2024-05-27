import { ethers } from 'ethers';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateWalletPage = (props: any) => {
  const [createdWallet, setCreatedWalled] = useState<any>();
  const navigate = useNavigate();

  function createWallet() {
    const wallet = ethers.Wallet.createRandom();

    setCreatedWalled(wallet);
  }

  return (
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => createWallet()}
      >
        Generate wallet
      </button>

      {createdWallet ? (
        <div>
          <h1>{createdWallet.mnemonic.phrase}</h1>
        </div>
      ) : (
        ''
      )}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      {createdWallet ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate('/login-page')}
        >
          Next
        </button>
      ) : (
        ''
      )}
    </div>
  );
};

export default CreateWalletPage;
