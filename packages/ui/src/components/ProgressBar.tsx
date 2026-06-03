import { cn } from '../utils/cn.js';

type ProgressBarProps = {
  /** Value 0..1 */
  value: number;
  className?: string;
  label?: string;
};

export function ProgressBar({ value, className, label }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-[var(--cc-surface-hover)]',
        className,
      )}
    >
      <div
        className="h-full bg-[var(--cc-primary)] transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
