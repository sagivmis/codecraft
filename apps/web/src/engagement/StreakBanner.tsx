import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button, cn } from '@codecraft/ui';
import { getAllLessons } from '@codecraft/content';

import { isStreakActiveToday, useStreak } from './useEngagement.js';

/**
 * Gentle nudge banner shown on the landing page / lesson index when the
 * student has an active streak but hasn't done anything today yet.
 * Disappears as soon as they complete a stage.
 */
export function StreakBanner({ className }: { className?: string }) {
  const streak = useStreak();
  if (streak.current === 0) return null;
  if (isStreakActiveToday(streak)) return null;

  const firstLesson = getAllLessons()[0];

  return (
    <motion.div
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'flex flex-col items-start gap-3 rounded-2xl border border-[var(--cc-primary)]/40',
        'bg-[var(--cc-primary)]/10 p-4 sm:flex-row sm:items-center',
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          🕯
        </span>
        <div>
          <p className="font-semibold">Don't break your {streak.current}-day streak</p>
          <p className="text-sm text-[var(--cc-fg-muted)]">
            Finish one stage today to keep it alive. It only takes a couple of minutes.
          </p>
        </div>
      </div>
      <div className="sm:ml-auto">
        <Link to={firstLesson ? `/lessons/${firstLesson.id}` : '/lessons'}>
          <Button variant="primary" size="sm">
            Quick lesson
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
