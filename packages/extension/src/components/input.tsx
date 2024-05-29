import React from 'react';

import { cn } from '../lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex text-foreground h-10 w-full rounded-[12px] bg-white px-[16px] py-[12px] text-[16px] leading-[24px] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A6A6CE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
