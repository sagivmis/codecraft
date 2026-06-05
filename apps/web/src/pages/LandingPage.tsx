import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, CodeBlock, cn, useTheme } from '@codecraft/ui';
import { getAllLessons } from '@codecraft/content';

import { OnboardingModal } from './onboarding/OnboardingModal.js';
import { useOnboarding } from './onboarding/useOnboarding.js';
import { StreakBanner, StreakChip, XpChip } from '../engagement/index.js';
import { ContinueLearning } from '../lesson-player/ContinueLearning.js';
import { useContinueLesson } from '../lesson-player/useContinueLesson.js';

const HERO_SNIPPET = `const score = 0;
const goal = 5;

while (score < goal) {
  practice();
  score++;
}

console.log('You did it!');`;

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { state, reset } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);

  /* Only open the modal once we've actually read from localStorage so we
   * don't flash it open for returning students. */
  useEffect(() => {
    if (!state.completed) setShowOnboarding(true);
  }, [state.completed]);

  const lessons = getAllLessons();
  const firstLesson = lessons[0];
  const continueLesson = useContinueLesson(theme);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-12 px-4 py-10 md:py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-xl font-bold tracking-tight">CodeCraft</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <StreakChip />
          <XpChip />
          <span className="hidden text-[var(--cc-fg-muted)] sm:inline">Track:</span>
          <Button
            variant={theme === 'kids' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('kids')}
          >
            Kids
          </Button>
          <Button
            variant={theme === 'teens' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('teens')}
          >
            Teens
          </Button>
        </div>
      </header>

      <StreakBanner />


      <section className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-1 text-xs font-semibold text-[var(--cc-fg-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--cc-success)]" />
            v1 · 5 JavaScript lessons live
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            Learn to code,
            <br />
            one tiny step at a time.
          </h1>
          <p className="max-w-prose text-lg text-[var(--cc-fg-muted)]">
            Interactive JavaScript and TypeScript lessons for ages 9 to 18.{' '}
            <span className="text-[var(--cc-fg)]">Watch. Fix. Build.</span> A custom code keyboard
            makes real typing viable on a phone.
          </p>
          <div className="flex flex-wrap gap-3">
            {continueLesson ? (
              <ContinueLearning continueLesson={continueLesson} variant="hero" />
            ) : (
              firstLesson && (
                <Link to={`/lessons/${firstLesson.id}`}>
                  <Button size="lg">Start the first lesson</Button>
                </Link>
              )
            )}
            <Link to="/lessons">
              <Button size="lg" variant="secondary">
                Browse the curriculum
              </Button>
            </Link>
          </div>
          {state.completed && (
            <button
              onClick={() => {
                reset();
                setShowOnboarding(true);
              }}
              className="text-xs text-[var(--cc-fg-muted)] underline hover:text-[var(--cc-fg)]"
            >
              Re-run onboarding
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-3 shadow-xl"
          aria-hidden="true"
        >
          <div className="mb-2 flex items-center gap-1.5 px-2 pt-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--cc-danger)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--cc-primary)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--cc-success)]" />
            <span className="ml-2 text-xs text-[var(--cc-fg-muted)]">lesson-preview.js</span>
          </div>
          <CodeBlock code={HERO_SNIPPET} />
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          icon="🎬"
          title="Animated walkthroughs"
          description="Line-by-line code reveals with narrated explanations and precise highlights."
        />
        <FeatureCard
          icon="🛠"
          title="Fix-the-bug puzzles"
          description="Spot a sneaky mistake and patch it. We give hints, not the answer."
        />
        <FeatureCard
          icon="✅"
          title="Real coding + tests"
          description="Build it yourself, run real tests in a sandboxed worker, see human-friendly errors."
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your first lessons</h2>
          <Link
            to="/lessons"
            className="text-sm text-[var(--cc-primary)] underline hover:text-[var(--cc-primary-hover)]"
          >
            See all →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.slice(0, 4).map((lesson) => {
            const variant = lesson.variants[theme];
            return (
              <Link key={lesson.id} to={`/lessons/${lesson.id}`} className="block">
                <Card
                  className={cn(
                    'h-full p-4 transition-all',
                    'hover:-translate-y-0.5 hover:border-[var(--cc-primary)] hover:shadow-lg',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold">{variant.title}</h3>
                    <span className="rounded-full bg-[var(--cc-surface-hover)] px-2 py-0.5 text-xs font-medium text-[var(--cc-fg-muted)]">
                      {lesson.tier}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">{variant.subtitle}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="mt-auto flex flex-col items-center gap-2 pt-8 text-xs text-[var(--cc-fg-muted)]">
        <p>Built with React, Vite, Monaco, and a lot of love for tiny humans learning to code.</p>
        <Link to="/preview" className="underline hover:text-[var(--cc-fg)]">
          QA preview dashboard
        </Link>
      </footer>

      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-3xl" aria-hidden="true">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">{description}</p>
    </Card>
  );
}

function Logo() {
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--cc-primary)] font-mono text-base font-bold text-[var(--cc-primary-fg)]"
    >
      {'<>'}
    </span>
  );
}
