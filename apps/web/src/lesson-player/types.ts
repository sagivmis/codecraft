import type { Lesson } from '@codecraft/schema';

/**
 * The ordered list of stage keys a student moves through.
 * Use kebab-case in URLs; the conversions are centralized in `stageRouting.ts`.
 */
export const STAGE_KEYS = ['hook', 'walkthrough', 'quiz', 'fix-the-bug', 'implement'] as const;

export type StageKey = (typeof STAGE_KEYS)[number];

/** Maps URL stage keys back to the matching field on `lesson.stages`. */
export const STAGE_LESSON_FIELD: Record<StageKey, keyof Lesson['stages']> = {
  hook: 'hook',
  walkthrough: 'walkthrough',
  quiz: 'quiz',
  'fix-the-bug': 'fixTheBug',
  implement: 'implement',
};

export const STAGE_LABELS: Record<StageKey, string> = {
  hook: 'Hook',
  walkthrough: 'Walkthrough',
  quiz: 'Quiz',
  'fix-the-bug': 'Fix the bug',
  implement: 'Implement',
};

export type StageStatus = 'not-started' | 'in-progress' | 'completed' | 'attempted';

export type StageProgress = {
  status: StageStatus;
  attempts: number;
  /** Optional per-stage data (e.g. quiz score). */
  meta?: Record<string, unknown>;
};

export type LessonProgress = {
  lessonId: string;
  stages: Record<StageKey, StageProgress>;
  startedAt?: number;
  completedAt?: number;
};

export function makeInitialProgress(lessonId: string): LessonProgress {
  const stages = {} as Record<StageKey, StageProgress>;
  for (const key of STAGE_KEYS) {
    stages[key] = { status: 'not-started', attempts: 0 };
  }
  return { lessonId, stages };
}

export function nextStage(current: StageKey): StageKey | null {
  const idx = STAGE_KEYS.indexOf(current);
  if (idx === -1 || idx === STAGE_KEYS.length - 1) return null;
  return STAGE_KEYS[idx + 1] ?? null;
}

export function prevStage(current: StageKey): StageKey | null {
  const idx = STAGE_KEYS.indexOf(current);
  if (idx <= 0) return null;
  return STAGE_KEYS[idx - 1] ?? null;
}

export function isStageKey(value: string): value is StageKey {
  return (STAGE_KEYS as readonly string[]).includes(value);
}
