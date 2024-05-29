import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Copy } from 'lucide-react';
import { Button } from '../../../components/button';
import { useNavigate } from 'react-router-dom';
import { UIRoutes } from '../../../lib/popup-routes';

interface CopyMnemonicProps {
  mnemonic: string;
  setIsNextDisabled: (isNextDisabled: boolean) => void;
}
export const CopyMnemonic = ({
  mnemonic,
  setIsNextDisabled,
}: CopyMnemonicProps) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [parent] = useAutoAnimate();

  const onCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setIsNextDisabled(false);
  };

  const onIHaveMySeedPhrase = () => {
    navigate(`/${UIRoutes.enterMnemonic.path}`);
  };

  return (
    <div className="mb-[16px] bg-white rounded-[16px] p-[16px] flex flex-col gap-[24px]">
      <div className="text-[16px] leading-[24px] font-medium">Seed phrase</div>
      <div className="grid grid-cols-3 gap-y-[16px] w-full">
        {mnemonic.split(' ').map((word, index) => (
          <div key={word} className="flex items-center gap-[8px]">
            <div className="flex justify-center items-center rounded-full w-[20px] h-[20px] text-white bg-primary text-[10px] leading-[16px] font-medium">
              {index + 1}
            </div>
            <div className="text-[14px] leading-[22px] text-muted-foreground">
              {word}
            </div>
          </div>
        ))}
      </div>
      <div ref={parent}>
        <div
          className="flex items-center gap-[22px] py-[21px] justify-center"
          ref={parent}
        >
          {copied ? (
            <div className="text-[14px] leading-[22px] text-success">
              Copied successfully
            </div>
          ) : (
            <>
              <Button
                variant="secondary"
                className="flex-1 py-[8px]"
                onClick={onIHaveMySeedPhrase}
              >
                I have my seed phrase
              </Button>
              <Button
                variant="secondary"
                className="flex-1 py-[8px]"
                onClick={onCopy}
              >
                Copy seed phrase <Copy size={16} className="ml-[9px]" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
