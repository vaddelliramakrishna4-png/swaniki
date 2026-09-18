import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]';

    const variantStyles = {
      primary: 'bg-[#1A1A2E] text-white hover:bg-[#16213E] shadow-sm',
      accent:
        'bg-[#E8621A] text-white hover:bg-[#D45510] shadow-md font-bold tracking-wide',
      outline:
        'bg-transparent border border-[#C8C4BF] text-[#1A1A2E] hover:bg-[#F0EDE8]',
      ghost: 'bg-transparent text-[#4B4B4B] hover:bg-[#F0EDE8] hover:text-[#1A1A2E]',
      secondary: 'bg-[#F0EDE8] text-[#1A1A2E] hover:bg-[#E8E4DF]',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm rounded-[10px]',
      sm: 'h-8 px-3 text-xs rounded-lg',
      lg: 'h-12 px-6 text-base rounded-[10px]',
      icon: 'h-9 w-9 rounded-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
