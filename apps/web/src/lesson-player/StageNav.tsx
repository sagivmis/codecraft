import { cn } from '@codecraft/ui';
import { STAGE_KEYS, STAGE_LABELS, type StageKey } from './types.js';
import type { LessonProgress } from './types.js';

type StageNavProps = {
  current: StageKey;
  progress: LessonProgress;
  onJump: (stage: StageKey) => void;
};

export function StageNav({ current, progress, onJump }: StageNavProps) {
  return (
    <nav aria-label="Lesson progress" className="flex flex-wrap items-center gap-2">
      {STAGE_KEYS.map((key, index) => {
        const status = progress.stages[key].status;
        const isCurrent = key === currentKey(current);
        const isCompleted = status === 'completed';
        const isAttempted = status === 'attempted';
        const reachable = canReach(key, progress);
        return (
          <button
            key={key}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onJump(key)}
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              'border-[var(--cc-border)] bg-[var(--cc-surface)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !isCurrent && 'hover:bg-[var(--cc-surface-hover)]',
              isCurrent && 'border-[var(--cc-primary)] bg-[var(--cc-primary)] text-[var(--cc-primary-fg)]',
              isCompleted && !isCurrent && 'border-[var(--cc-success)] text-[var(--cc-success)]',
              isAttempted && !isCurrent && 'border-[var(--cc-fg-muted)] text-[var(--cc-fg-muted)]',
            )}
          >
            <span
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                isCurrent
                  ? 'bg-[var(--cc-primary-fg)] text-[var(--cc-primary)]'
                  : isCompleted
                    ? 'bg-[var(--cc-success)] text-white'
                    : 'bg-[var(--cc-surface-hover)] text-[var(--cc-fg-muted)]',
              )}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            <span className="hidden sm:inline">{STAGE_LABELS[key]}</span>
          </button>
        );
      })}
    </nav>
  );
}

function currentKey(current: StageKey): StageKey {
  return current;
}

function canReach(target: StageKey, progress: LessonProgress): boolean {
  const idx = STAGE_KEYS.indexOf(target);
  if (idx <= 0) return true;
  for (let i = 0; i < idx; i++) {
    const k = STAGE_KEYS[i];
    if (k === undefined) continue;
    const s = progress.stages[k].status;
    if (s !== 'completed' && s !== 'attempted') return false;
  }
  return true;
}
