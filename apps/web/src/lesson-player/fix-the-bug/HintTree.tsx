import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn } from '@codecraft/ui';

type HintTreeProps = {
  hints: string[];
  /** Optional callback whenever a new hint is revealed. */
  onReveal?: (revealedCount: number) => void;
};

/**
 * Progressive hint reveal. The student requests hints one at a time; each
 * is shown with a friendly "are you sure?" delay step where the next hint
 * is more direct. The last hint typically contains the answer.
 */
export function HintTree({ hints, onReveal }: HintTreeProps) {
  const [revealed, setRevealed] = useState(0);
  const hasMore = revealed < hints.length;

  const reveal = () => {
    const next = revealed + 1;
    setRevealed(next);
    onReveal?.(next);
  };

  return (
    <div className="rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface)] p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">
          Hints <span className="text-[var(--cc-fg-muted)]">({revealed}/{hints.length})</span>
        </span>
        <div className="flex-1" />
        {hasMore && (
          <Button variant="ghost" size="sm" onClick={reveal}>
            {revealed === 0
              ? 'Reveal a hint'
              : revealed === hints.length - 1
                ? 'Show the answer'
                : 'Next hint'}
          </Button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {revealed === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm text-[var(--cc-fg-muted)]"
          >
            Stuck? Tap "Reveal a hint" - hints get more direct as you go.
          </motion.p>
        ) : (
          <ol className="mt-2 ml-5 list-decimal space-y-2">
            {hints.slice(0, revealed).map((hint, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'text-sm',
                  i === revealed - 1 && 'font-medium',
                )}
              >
                {hint}
              </motion.li>
            ))}
          </ol>
        )}
      </AnimatePresence>
    </div>
  );
}
