import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/button';

export const Mnemonics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate('/create-wallet')}>
          Create new Mnemonic
        </Button>

        <Button onClick={() => navigate('/login-page')}>
          Use existing Mnemonic
        </Button>
      </div>
    </div>
  );
};
