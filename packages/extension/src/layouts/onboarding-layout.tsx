import React, { PropsWithChildren } from 'react';
import { Button } from '../components/button';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Loader2 } from 'lucide-react';

export interface OnboardingLayoutProps extends PropsWithChildren<{}> {
  title: string;
  description: string;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
}

export const OnboardingLayout = ({
  title,
  description,
  children,
  onBack,
  onNext,
  isNextDisabled,
  isNextLoading,
}: OnboardingLayoutProps) => {
  const [parent] = useAutoAnimate();

  return (
    <div className="py-[32px] px-[24px] flex flex-col gap-[16px] h-full">
      <div className="text-[24px] leading-[32px] font-bold text-foreground">
        {title}
      </div>
      <div className="text-[16px] leading-[24px] text-muted-foreground">
        {description}
      </div>
      <div className="flex-1" ref={parent}>
        {children}
      </div>
      <div className="flex items-center gap-[24px]">
        <Button onClick={onBack} className="flex-1" variant="outline">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1" disabled={isNextDisabled}>
          {isNextLoading && <Loader2 className="animate-spin mr-2" />} Next
        </Button>
      </div>
    </div>
  );
};
