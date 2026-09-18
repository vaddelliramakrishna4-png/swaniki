import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'confirmed' | 'waitlisted' | 'hot' | 'draft' | 'gold' | 'outline' | 'default';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#1A1A2E] text-white',
    confirmed: 'bg-[#E8F5EE] text-[#1A7A4A] border border-[#1A7A4A]/20',
    waitlisted: 'bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/20',
    hot: 'bg-[#FEF0E7] text-[#E8621A] border border-[#E8621A]/30',
    draft: 'bg-[#F0EDE8] text-[#8A8A8A] border border-[#E8E4DF]',
    gold: 'bg-[#FDF6E7] text-[#C9A84C] border border-[#C9A84C]/30',
    outline: 'border border-[#C8C4BF] text-[#1A1A2E] bg-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
