import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ padded = true, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-sm',
        padded && 'p-5 md:p-6',
        className,
      )}
      {...rest}
    />
  );
}
