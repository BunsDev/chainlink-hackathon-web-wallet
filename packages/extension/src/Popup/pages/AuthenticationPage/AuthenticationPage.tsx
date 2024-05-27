import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthenticationPage = (props: any) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col ">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('./login-page')}
      >
        Login
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('./create-wallet')}
      >
        Create Wallet
      </button>
    </div>
  );
};

export default AuthenticationPage;
