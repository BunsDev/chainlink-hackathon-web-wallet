import React, { useState } from 'react';
import { OnboardingLayout } from '../../../layouts/onboarding-layout';
import { Input } from '../../../components/input';
import { cn } from '../../../lib/utils/cn';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';
import { useMnemonic } from '../../hooks/use-mnemonic';
import { useInitializeWallet } from '../../hooks/mutations/use-initialize-wallet';

export const CreatePasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const mnemonic = useMnemonic((state) => state.mnemonic);
  const { mutateAsync: initializeWallet, isPending } = useInitializeWallet();

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setPassword(password);
    setIsNextDisabled(
      password.trim() === '' ||
        confirmPassword.trim() === '' ||
        password !== confirmPassword
    );
  };

  const onConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    setError(false);
    setIsNextDisabled(
      password.trim() === '' ||
        confirmPassword.trim() === '' ||
        password !== confirmPassword
    );
  };

  const onBlur = () => {
    setError(confirmPassword.trim() !== '' && password !== confirmPassword);
  };

  const onBack = () => navigate(`/${UIRoutes.initializeWallet.path}`);

  const onNext = async () => {
    if (isNextDisabled || error) return;
    await initializeWallet({ mnemonic, walletPassword: password });
    navigate('/');
  };

  return (
    <OnboardingLayout
      title="Create password"
      description="Please make sure your password contains:"
      onBack={onBack}
      onNext={onNext}
      isNextDisabled={isNextDisabled}
      isNextLoading={isPending}
    >
      <div className="flex flex-col gap-[16px]">
        <Input
          placeholder="Enter password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          onBlur={onBlur}
        />
        <div className="flex flex-col gap-[6px]">
          <Input
            placeholder="Confirm password"
            type="password"
            className={cn(error && 'ring-error ring-[1px]')}
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            onBlur={onBlur}
          />
          {error && (
            <div className="text-error text-[12px] leading-[14px]">
              Passwords don&apos;t match
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
};
