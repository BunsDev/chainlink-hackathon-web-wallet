import React, { useMemo, useState } from 'react';
import { OnboardingLayout } from '../../../layouts/onboarding-layout';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';
import { useMnemonic } from '../../hooks/use-mnemonic';
import { CopyMnemonic } from './copy-mnemonic';
import { ConfirmMnemonic } from './confirm-mnemonic';

enum Steps {
  CopyMnemonic = 'CopyMnemonic',
  ConfirmMnemonic = 'ConfirmMnemonic',
}

export const InitializeWallet: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(Steps.CopyMnemonic);
  const mnemonic = useMnemonic((state) => state.mnemonic);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const onBack = () => {
    if (step === Steps.ConfirmMnemonic) {
      setIsNextDisabled(true);
      return setStep(Steps.CopyMnemonic);
    }

    if (step === Steps.CopyMnemonic) {
      return navigate(`/${UIRoutes.welcome.path}`);
    }
  };

  const onNext = () => {
    if (step === Steps.CopyMnemonic) {
      setIsNextDisabled(true);
      return setStep(Steps.ConfirmMnemonic);
    }

    if (step === Steps.ConfirmMnemonic) {
      return navigate(`/${UIRoutes.createPassword.path}`);
    }
  };

  const stepMapping = useMemo(
    () => ({
      [Steps.CopyMnemonic]: {
        title: 'Save your seed phrase',
        element: (
          <CopyMnemonic
            mnemonic={mnemonic}
            setIsNextDisabled={setIsNextDisabled}
          />
        ),
      },
      [Steps.ConfirmMnemonic]: {
        title: 'Confirm your seed phrase',
        element: (
          <ConfirmMnemonic
            mnemonic={mnemonic}
            setIsNextDisabled={setIsNextDisabled}
          />
        ),
      },
    }),
    [mnemonic]
  );

  return (
    <OnboardingLayout
      title={stepMapping[step].title}
      description="This seed phrase allows you to recover your account. Write down the word phrase below and keep it in a safe place."
      onBack={onBack}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
    >
      {stepMapping[step].element ?? null}
    </OnboardingLayout>
  );
};
