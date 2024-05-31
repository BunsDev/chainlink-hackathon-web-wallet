import React, { useState } from 'react';
import { Textarea } from '../../../components/textarea';
import { cn } from '../../../lib/utils/cn';

interface ConfirmMnemonicProps {
  mnemonic: string;
  setIsNextDisabled: (isNextDisabled: boolean) => void;
}
export const ConfirmMnemonic = ({
  mnemonic,
  setIsNextDisabled,
}: ConfirmMnemonicProps) => {
  const [enteredMnemonic, setEnteredMnemonic] = useState('');

  const [error, setError] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const enteredMnemonic = e.target.value;
    setIsNextDisabled(enteredMnemonic !== mnemonic);
    setEnteredMnemonic(enteredMnemonic);
    setError(false);
  };

  const onBlur = () => {
    setError(enteredMnemonic.trim() !== '' && enteredMnemonic !== mnemonic);
  };

  return (
    <div className="mb-[16px] bg-white rounded-[16px] px-[16px] pt-[16px] pb-[54px] flex flex-col gap-[24px]">
      <div className="text-[16px] leading-[24px] font-medium">Seed phrase</div>
      <div className="grid grid-cols-4 gap-y-[16px] w-full">
        {mnemonic.split(' ').map((word) => (
          <div
            key={word}
            className="text-[14px] leading-[22px] text-muted-foreground"
          >
            {word}
          </div>
        ))}
      </div>
      <div className="mt-[8px] flex flex-col gap-[6px]">
        <Textarea
          placeholder="Type seed phrase"
          value={enteredMnemonic}
          onChange={onChange}
          className={cn(error && 'ring-error ring-[1px]')}
          onBlur={onBlur}
        />
        {error && (
          <div className="text-error text-[12px] leading-[20px]">
            Seed phrase isn&apos;t correct
          </div>
        )}
      </div>
    </div>
  );
};
