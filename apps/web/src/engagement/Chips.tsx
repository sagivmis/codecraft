import { motion } from 'framer-motion';
import { cn } from '@codecraft/ui';

import { isStreakActiveToday, useStreak, useXp } from './useEngagement.js';

/**
 * Header chip for the current streak. Shows a flame when active today, a
 * faded outline when the user has a streak but hasn't been active yet
 * today (the "don't break it" state), and nothing at all before the user
 * has earned a streak.
 */
export function StreakChip({ className }: { className?: string }) {
  const streak = useStreak();
  if (streak.current === 0) return null;

  const activeToday = isStreakActiveToday(streak);

  return (
    <motion.div
      layout
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold',
        activeToday
          ? 'bg-[var(--cc-primary)]/15 text-[var(--cc-primary)]'
          : 'border border-[var(--cc-border)] text-[var(--cc-fg-muted)]',
        className,
      )}
      title={`Longest streak: ${streak.longest} day${streak.longest === 1 ? '' : 's'}`}
      aria-label={`Streak: ${streak.current} day${streak.current === 1 ? '' : 's'}`}
    >
      <span aria-hidden>{activeToday ? '🔥' : '🕯'}</span>
      <span>{streak.current}</span>
    </motion.div>
  );
}

/** Header chip showing total XP. Hidden until the student has earned XP. */
export function XpChip({ className }: { className?: string }) {
  const xp = useXp();
  if (xp.total === 0) return null;
  return (
    <motion.div
      layout
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold',
        'bg-[var(--cc-success)]/15 text-[var(--cc-success)]',
        className,
      )}
      aria-label={`Total XP: ${xp.total}`}
    >
      <span aria-hidden>✦</span>
      <span>{xp.total} XP</span>
    </motion.div>
  );
}
