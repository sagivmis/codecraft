import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@codecraft/ui';

import { CELEBRATION_PARTICLE_COLORS } from '@constants';

type CelebrationProps = {
  /** How much XP was awarded. Animated 0 → xpGained. */
  xpGained: number;
  /** Total XP after this lesson (shown beneath the counter). */
  xpTotal: number;
  /** Optional streak info to display alongside. */
  streakCurrent?: number;
  streakDelta?: 'unchanged' | 'started' | 'incremented' | 'reset' | null;
  /** Larger headline at the top. */
  headline?: string;
  /** Smaller copy beneath the headline. */
  subline?: string;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  delay: number;
};

/**
 * Big satisfying celebration overlay shown when a student finishes a lesson.
 *
 * Pure CSS / framer-motion confetti so we don't ship a canvas-confetti
 * dependency. Particles spawn from the headline anchor, fan out, fall, and
 * fade. The XP counter animates from 0 to `xpGained` using a stepped
 * setInterval so the digits visibly tick up.
 */
export function Celebration({
  xpGained,
  xpTotal,
  streakCurrent,
  streakDelta,
  headline = 'Nice work!',
  subline,
}: CelebrationProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      /* Spread within ±200px horizontally. */
      x: (Math.random() - 0.5) * 400,
      /* Fly downward 200..520px. */
      y: 200 + Math.random() * 320,
      rotate: (Math.random() - 0.5) * 720,
      color: CELEBRATION_PARTICLE_COLORS[i % CELEBRATION_PARTICLE_COLORS.length] as string,
      /* Stagger so they don't all spawn at the same instant. */
      delay: (i % 7) * 0.04,
    }));
  }, []);

  const [displayedXp, setDisplayedXp] = useState(0);

  useEffect(() => {
    if (xpGained <= 0) {
      setDisplayedXp(0);
      return;
    }
    const startedAt = performance.now();
    const durationMs = 900;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / durationMs);
      /* easeOutQuart for a satisfying decay. */
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplayedXp(Math.round(xpGained * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [xpGained]);

  return (
    <div className="pointer-events-none flex flex-col items-center gap-4">
      {/* Animated checkmark + headline */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        className="relative flex flex-col items-center gap-1"
      >
        <div className="relative">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--cc-success)]/15 text-5xl">
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 14 }}
              className="text-[var(--cc-success)]"
              aria-hidden
            >
              ✓
            </motion.span>
          </div>

          <AnimatePresence>
            {particles.map((p) => (
              <motion.span
                key={p.id}
                aria-hidden
                initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.6 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: p.x,
                  y: p.y,
                  rotate: p.rotate,
                  scale: 1,
                }}
                transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </AnimatePresence>
        </div>
        <h2 className="mt-1 text-3xl font-extrabold tracking-tight">{headline}</h2>
        {subline && <p className="text-sm text-[var(--cc-fg-muted)]">{subline}</p>}
      </motion.div>

      {/* XP counter */}
      {xpGained > 0 && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-1 rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] px-6 py-4 shadow-sm"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--cc-fg-muted)]">
            XP earned
          </span>
          <span className="text-4xl font-bold tabular-nums text-[var(--cc-success)]">
            +{displayedXp}
          </span>
          <span className="text-xs text-[var(--cc-fg-muted)]">{xpTotal} total</span>
        </motion.div>
      )}

      {/* Streak chip */}
      {streakCurrent && streakCurrent > 0 && streakDelta && streakDelta !== 'unchanged' && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
            'bg-[var(--cc-primary)]/15 text-[var(--cc-primary)]',
          )}
        >
          <span aria-hidden>🔥</span>
          <span>
            {streakDelta === 'started' && `Streak started — ${streakCurrent} day`}
            {streakDelta === 'incremented' && `${streakCurrent}-day streak!`}
            {streakDelta === 'reset' && `Restarting at ${streakCurrent} day — let's keep it going`}
          </span>
        </motion.div>
      )}
    </div>
  );
}
