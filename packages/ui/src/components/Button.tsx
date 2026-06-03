import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn.js';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

const baseClasses =
  'inline-flex items-center justify-center font-medium select-none transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
  'focus-visible:ring-[var(--cc-focus-ring)] focus-visible:ring-offset-[var(--cc-bg)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--cc-primary)] text-[var(--cc-primary-fg)] hover:bg-[var(--cc-primary-hover)]',
  secondary:
    'bg-[var(--cc-surface)] text-[var(--cc-fg)] border border-[var(--cc-border)] hover:bg-[var(--cc-surface-hover)]',
  ghost: 'text-[var(--cc-fg)] hover:bg-[var(--cc-surface-hover)]',
  danger: 'bg-[var(--cc-danger)] text-[var(--cc-danger-fg)] hover:bg-[var(--cc-danger-hover)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-md gap-1.5',
  md: 'h-11 px-4 text-base rounded-lg gap-2',
  lg: 'h-12 px-6 text-lg rounded-xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', fullWidth, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    />
  );
});
