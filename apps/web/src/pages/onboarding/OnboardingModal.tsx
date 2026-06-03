import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, Card, cn, useTheme } from '@codecraft/ui';
import type { Track } from '@codecraft/schema';

import { useOnboarding, type OnboardingState } from './useOnboarding.js';

type Step = 'age' | 'track' | 'preview';

type Props = {
  /** Called after the student finishes the flow (or skips it). */
  onDone: () => void;
};

/**
 * First-run onboarding overlay.
 *
 * Step 1: age bucket (under 13 vs 13+) — defaults the visual track.
 * Step 2: confirm or override the track with a side-by-side preview.
 * Step 3: brief preview of what a lesson looks like, with the CTA.
 */
export function OnboardingModal({ onDone }: Props) {
  const { complete } = useOnboarding();
  const { setTheme } = useTheme();
  const [step, setStep] = useState<Step>('age');
  const [ageBucket, setAgeBucket] = useState<OnboardingState['ageBucket']>('unknown');
  const [track, setTrack] = useState<Track>('teens');

  const chooseAge = (bucket: OnboardingState['ageBucket']) => {
    setAgeBucket(bucket);
    const defaultTrack: Track = bucket === 'under-13' ? 'kids' : 'teens';
    setTrack(defaultTrack);
    setTheme(defaultTrack);
    setStep('track');
  };

  const chooseTrack = (next: Track) => {
    setTrack(next);
    setTheme(next);
  };

  const finish = () => {
    complete({ ageBucket, track });
    onDone();
  };

  const skip = () => {
    complete({ ageBucket: 'unknown', track });
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="w-full max-w-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <Card className="space-y-5 p-6">
          <header className="flex items-center justify-between">
            <h2 id="onboarding-title" className="text-xl font-bold tracking-tight">
              Welcome to CodeCraft
            </h2>
            <button
              onClick={skip}
              className="text-xs text-[var(--cc-fg-muted)] underline hover:text-[var(--cc-fg)]"
            >
              Skip
            </button>
          </header>

          <AnimatePresence mode="wait">
            {step === 'age' && (
              <StepShell key="age">
                <p className="text-sm text-[var(--cc-fg-muted)]">
                  Quick question — we use your age only to pick a visual style. Nothing is saved to
                  a server.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceButton
                    title="I'm under 13"
                    subtitle="Bright, playful, mascot-friendly"
                    onClick={() => chooseAge('under-13')}
                  />
                  <ChoiceButton
                    title="I'm 13 or older"
                    subtitle="Modern, sleek, dev-tool vibe"
                    onClick={() => chooseAge('13-plus')}
                  />
                </div>
                <button
                  onClick={() => chooseAge('unknown')}
                  className="text-sm text-[var(--cc-fg-muted)] underline hover:text-[var(--cc-fg)]"
                >
                  I'd rather not say
                </button>
              </StepShell>
            )}

            {step === 'track' && (
              <StepShell key="track">
                <p className="text-sm text-[var(--cc-fg-muted)]">
                  Pick your style. You can switch anytime.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TrackPreview
                    label="Kids"
                    accent="bg-gradient-to-br from-pink-400 via-orange-300 to-yellow-300"
                    selected={track === 'kids'}
                    onClick={() => chooseTrack('kids')}
                  >
                    <p className="font-semibold">Hey, coder!</p>
                    <p className="text-xs">Fun colors, big buttons, mascot helpers.</p>
                  </TrackPreview>
                  <TrackPreview
                    label="Teens"
                    accent="bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400"
                    selected={track === 'teens'}
                    onClick={() => chooseTrack('teens')}
                  >
                    <p className="font-semibold">Welcome back.</p>
                    <p className="text-xs">Editor-first UI, dark theme, dev shortcuts.</p>
                  </TrackPreview>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep('age')}>
                    Back
                  </Button>
                  <Button variant="primary" onClick={() => setStep('preview')}>
                    Continue
                  </Button>
                </div>
              </StepShell>
            )}

            {step === 'preview' && (
              <StepShell key="preview">
                <p className="text-sm text-[var(--cc-fg-muted)]">
                  Every lesson runs through five short stages — each is tap-friendly and you can
                  pause anytime.
                </p>
                <ol className="space-y-2 rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-3 text-sm">
                  <li>
                    <strong>1. Hook</strong> — a quick "why does this matter?"
                  </li>
                  <li>
                    <strong>2. Animated walkthrough</strong> — line-by-line code, narrated.
                  </li>
                  <li>
                    <strong>3. Mini-quiz</strong> — check that the idea landed.
                  </li>
                  <li>
                    <strong>4. Fix the bug</strong> — find and repair a sneaky mistake.
                  </li>
                  <li>
                    <strong>5. Build it</strong> — write code, run real tests.
                  </li>
                </ol>
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep('track')}>
                    Back
                  </Button>
                  <Button variant="primary" size="lg" onClick={finish}>
                    Let's go
                  </Button>
                </div>
              </StepShell>
            )}
          </AnimatePresence>

          <StepDots step={step} />
        </Card>
      </motion.div>
    </div>
  );
}

function StepShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.18 }}
      className="flex flex-col gap-4"
    >
      {children}
    </motion.div>
  );
}

function ChoiceButton({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-1 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 text-left',
        'transition-all hover:-translate-y-0.5 hover:border-[var(--cc-primary)] hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-[var(--cc-focus-ring)]',
      )}
    >
      <span className="font-semibold">{title}</span>
      <span className="text-xs text-[var(--cc-fg-muted)]">{subtitle}</span>
    </button>
  );
}

function TrackPreview({
  label,
  accent,
  selected,
  onClick,
  children,
}: {
  label: string;
  accent: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group flex flex-col gap-2 overflow-hidden rounded-xl border text-left transition-all',
        selected
          ? 'border-[var(--cc-primary)] ring-2 ring-[var(--cc-focus-ring)]'
          : 'border-[var(--cc-border)] hover:border-[var(--cc-primary)]',
      )}
    >
      <div className={cn('h-16 w-full', accent)} aria-hidden="true" />
      <div className="flex flex-col gap-1 px-3 pb-3 pt-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-fg-muted)]">
          {label}
        </p>
        {children}
      </div>
    </button>
  );
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ['age', 'track', 'preview'];
  return (
    <div className="flex justify-center gap-1.5" aria-hidden="true">
      {order.map((s) => (
        <span
          key={s}
          className={cn(
            'h-1.5 w-6 rounded-full transition-colors',
            s === step ? 'bg-[var(--cc-primary)]' : 'bg-[var(--cc-border)]',
          )}
        />
      ))}
    </div>
  );
}
