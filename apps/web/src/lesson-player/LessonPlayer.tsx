import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, useTheme } from '@codecraft/ui';
import { getLessonById } from '@codecraft/content';

import { Celebration, useEngagement } from '../engagement/index.js';
import { firstIncompleteStage, useLessonProgress } from './progress.js';
import { StageNav } from './StageNav.js';
import {
  STAGE_KEYS,
  STAGE_LABELS,
  isStageKey,
  nextStage,
  prevStage,
  type StageKey,
} from './types.js';
import { HookStageView } from './stages/HookStageView.js';
import { WalkthroughStageView } from './stages/WalkthroughStageView.js';
import { QuizStageView } from './stages/QuizStageView.js';
import { FixTheBugStageView } from './stages/FixTheBugStageView.js';
import { ImplementStageView } from './stages/ImplementStageView.js';
import type { StageResult } from './stages/types.js';

export function LessonPlayer() {
  const params = useParams<{ lessonId: string; stage?: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const lessonId = params.lessonId ?? '';
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);

  const { progress, markStage } = useLessonProgress(lessonId);
  const { completeStage } = useEngagement();
  /* Track XP earned this session so the celebration screen knows what to
   * animate. Resets when the user navigates to a new lesson. */
  const sessionXpRef = useRef(0);
  const sessionStreakRef = useRef<{
    current: number;
    delta: 'unchanged' | 'started' | 'incremented' | 'reset';
  } | null>(null);
  const [, setSessionTick] = useState(0);

  useEffect(() => {
    sessionXpRef.current = 0;
    sessionStreakRef.current = null;
    setSessionTick((t) => t + 1);
  }, [lessonId]);

  const currentStage: StageKey | null = useMemo(() => {
    if (params.stage && isStageKey(params.stage)) return params.stage;
    if (params.stage === undefined) return firstIncompleteStage(progress);
    return null;
  }, [params.stage, progress]);

  const goToStage = useCallback(
    (stage: StageKey) => {
      navigate(`/lessons/${lessonId}/${stage}`);
    },
    [lessonId, navigate],
  );

  const handleAdvance = useCallback(
    (stage: StageKey, result: StageResult) => {
      markStage(stage, result.status, result.meta);
      /* Award XP + bump streak when a stage is completed. The engagement
       * helpers are idempotent per (lesson, stage), so re-completing
       * doesn't double-count and re-visiting the same day doesn't restart
       * the streak. */
      if (result.status === 'completed') {
        const { xp, streak } = completeStage(lessonId, stage);
        sessionXpRef.current += xp.granted;
        if (streak.delta !== 'unchanged') {
          sessionStreakRef.current = { current: streak.state.current, delta: streak.delta };
        }
        setSessionTick((t) => t + 1);
      }
      const upcoming = nextStage(stage);
      if (upcoming) {
        goToStage(upcoming);
      } else {
        navigate(`/lessons/${lessonId}/complete`);
      }
    },
    [completeStage, goToStage, lessonId, markStage, navigate],
  );

  const handleBack = useCallback(
    (stage: StageKey) => {
      const previous = prevStage(stage);
      if (previous) goToStage(previous);
      else navigate('/lessons');
    },
    [goToStage, navigate],
  );

  if (!lesson) {
    return <LessonMissing id={lessonId} />;
  }

  if (params.stage === 'complete') {
    return (
      <LessonComplete
        lessonTitle={lesson.variants[theme].title}
        lessonId={lessonId}
        xpGained={sessionXpRef.current}
        streakSummary={sessionStreakRef.current}
      />
    );
  }

  if (!currentStage) {
    return <LessonMissing id={lessonId} reason="Unknown stage." />;
  }

  const stageProgress = progress.stages[currentStage];
  const variant = lesson.variants[theme];

  const sharedProps = {
    lesson,
    track: theme,
    stageKey: currentStage,
    progress: stageProgress,
    onAdvance: (result: StageResult) => handleAdvance(currentStage, result),
    onBack: () => handleBack(currentStage),
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-5 px-4 py-6 md:py-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/lessons')}
            className="text-sm text-[var(--cc-fg-muted)] hover:text-[var(--cc-fg)]"
          >
            ← All lessons
          </button>
          <span className="text-xs uppercase tracking-wider text-[var(--cc-fg-muted)]">
            {STAGE_LABELS[currentStage]}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{variant.title}</h1>
          {variant.subtitle && (
            <p className="text-sm text-[var(--cc-fg-muted)]">{variant.subtitle}</p>
          )}
        </div>
        <StageNav current={currentStage} progress={progress} onJump={goToStage} />
      </header>

      <section>
        {currentStage === 'hook' && <HookStageView {...sharedProps} />}
        {currentStage === 'walkthrough' && <WalkthroughStageView {...sharedProps} />}
        {currentStage === 'quiz' && <QuizStageView {...sharedProps} />}
        {currentStage === 'fix-the-bug' && <FixTheBugStageView {...sharedProps} />}
        {currentStage === 'implement' && <ImplementStageView {...sharedProps} />}
      </section>
    </main>
  );
}

function LessonComplete({
  lessonTitle,
  lessonId,
  xpGained,
  streakSummary,
}: {
  lessonTitle: string;
  lessonId: string;
  xpGained: number;
  streakSummary: {
    current: number;
    delta: 'unchanged' | 'started' | 'incremented' | 'reset';
  } | null;
}) {
  const navigate = useNavigate();
  const { xp } = useEngagement();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <Celebration
        xpGained={xpGained}
        xpTotal={xp.total}
        streakCurrent={streakSummary?.current}
        streakDelta={streakSummary?.delta ?? null}
        headline={`You finished "${lessonTitle}"`}
        subline="One small step closer to thinking like a programmer."
      />
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={() => navigate('/lessons')}>
          Pick the next lesson
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(`/lessons/${lessonId}/${STAGE_KEYS[0]}`)}
        >
          Replay this lesson
        </Button>
      </div>
    </main>
  );
}

function LessonMissing({ id, reason }: { id: string; reason?: string }) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Card>
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-sm text-[var(--cc-fg-muted)]">
          {reason ?? `We could not find a lesson with id "${id}".`}
        </p>
        <Button className="mt-4" onClick={() => navigate('/lessons')}>
          Back to the lesson list
        </Button>
      </Card>
    </main>
  );
}
