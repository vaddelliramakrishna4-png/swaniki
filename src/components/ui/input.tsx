import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#E8E4DF] bg-[#F9F7F4] px-3.5 py-2 text-sm text-[#0F0F0F] placeholder:text-[#8A8A8A] transition-colors focus:bg-white focus:border-[#1A1A2E] focus:outline-none focus:ring-1 focus:ring-[#1A1A2E] disabled:cursor-not-allowed disabled:opacity-50',
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
