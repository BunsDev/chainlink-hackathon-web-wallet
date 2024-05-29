import React, { useEffect } from 'react';
import { Button } from '../../../components/button';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';
import { useMnemonic } from '../../hooks/use-mnemonic';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const initMnemonic = useMnemonic((state) => state.createRandom);

  useEffect(() => {
    initMnemonic();
  }, [initMnemonic]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center">
        <div className="flex mb-[54px] gap-[24px] items-center">
          <img src="/assets/main_logo.svg" alt="logo" />
          <img src="/assets/main_text.svg" alt="text" />
        </div>
        <div className="text-[24px] font-bold leading-[29px] mb-[40px]">
          Welcome to Web 7.0
        </div>
        <Button
          className="w-[185px]"
          onClick={() => navigate(`/${UIRoutes.initializeWallet.path}`)}
        >
          Create account
        </Button>
      </div>
    </div>
  );
};
