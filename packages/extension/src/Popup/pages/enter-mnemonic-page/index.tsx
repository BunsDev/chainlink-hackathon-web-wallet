import React, { ChangeEvent, useState } from 'react';
import { OnboardingLayout } from '../../../layouts/onboarding-layout';
import { Textarea } from '../../../components/textarea';
import { cn } from '../../../lib/utils/cn';
import { Wallet } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';
import { useMnemonic } from '../../hooks/use-mnemonic';

export const EnterMnemonicPage = () => {
  const navigate = useNavigate();
  const setMnemonic = useMnemonic((state) => state.setMnemonic);
  const [enteredMnemonic, setEnteredMnemonic] = useState('');
  const [error, setError] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setError(false);
    const enteredMnemonic = e.target.value;
    setEnteredMnemonic(enteredMnemonic);
    try {
      Wallet.fromMnemonic(enteredMnemonic);
      setIsNextDisabled(false);
    } catch (e) {
      setIsNextDisabled(true);
    }
  };

  const onBlur = () => {
    if (!enteredMnemonic) {
      return;
    }
    try {
      Wallet.fromMnemonic(enteredMnemonic);
    } catch (e) {
      setError(true);
    }
  };

  const onBack = () => {
    navigate(`/${UIRoutes.initializeWallet.path}`);
  };

  const onNext = () => {
    if (isNextDisabled || error) return;
    setMnemonic(enteredMnemonic);
    navigate(`/${UIRoutes.createPassword.path}`);
  };

  return (
    <OnboardingLayout
      title="Enter your seed phrase"
      description="If you've already have a seed phrase, please enter it below."
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={isNextDisabled}
    >
      <div className="flex flex-col gap-[16px]">
        <div className="text-[16px] font-medium leading-[24px]">
          Seed phrase
        </div>
        <Textarea
          placeholder="Type seed phrase"
          className={cn(error && 'ring-[1px] ring-error')}
          value={enteredMnemonic}
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
    </OnboardingLayout>
  );
};
