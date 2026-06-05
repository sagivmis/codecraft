import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS } from '@constants';

import {
  STAGE_KEYS,
  makeInitialProgress,
  type LessonProgress,
  type StageKey,
  type StageProgress,
  type StageStatus,
} from './types.js';

const STORAGE_KEY_PREFIX = STORAGE_KEYS.PROGRESS_PREFIX;

function storageKey(lessonId: string): string {
  return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

/** Read persisted progress for one lesson (SSR-safe). */
export function readLessonProgress(lessonId: string): LessonProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey(lessonId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LessonProgress;
    if (parsed.lessonId !== lessonId) return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

/**
 * Defensive read: if a saved blob is missing keys we added later, fill them in
 * with `not-started`. This avoids `undefined` access in components.
 */
function migrate(progress: LessonProgress): LessonProgress {
  const stages = { ...progress.stages };
  for (const key of STAGE_KEYS) {
    if (!stages[key]) {
      stages[key] = { status: 'not-started', attempts: 0 };
    }
  }
  return { ...progress, stages };
}

function writeToStorage(progress: LessonProgress): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(progress.lessonId), JSON.stringify(progress));
}

export function useLessonProgress(lessonId: string) {
  const [progress, setProgress] = useState<LessonProgress>(
    () => readLessonProgress(lessonId) ?? makeInitialProgress(lessonId),
  );

  useEffect(() => {
    setProgress(readLessonProgress(lessonId) ?? makeInitialProgress(lessonId));
  }, [lessonId]);

  const persist = useCallback((next: LessonProgress) => {
    writeToStorage(next);
    setProgress(next);
  }, []);

  const updateStage = useCallback((stage: StageKey, patch: Partial<StageProgress>) => {
    setProgress((current) => {
      const previousStage = current.stages[stage];
      const updated: LessonProgress = {
        ...current,
        startedAt: current.startedAt ?? Date.now(),
        stages: {
          ...current.stages,
          [stage]: { ...previousStage, ...patch },
        },
      };
      const allComplete = STAGE_KEYS.every((k) => updated.stages[k].status === 'completed');
      if (allComplete && !updated.completedAt) {
        updated.completedAt = Date.now();
      }
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const markStage = useCallback(
    (stage: StageKey, status: StageStatus, meta?: Record<string, unknown>) => {
      updateStage(stage, {
        status,
        attempts: (progress.stages[stage].attempts ?? 0) + (status === 'in-progress' ? 0 : 1),
        ...(meta ? { meta } : {}),
      });
    },
    [progress.stages, updateStage],
  );

  const reset = useCallback(() => {
    const fresh = makeInitialProgress(lessonId);
    persist(fresh);
  }, [lessonId, persist]);

  return { progress, markStage, updateStage, persist, reset };
}

/** Pick the first stage that is not yet completed. Defaults to the first stage. */
export function firstIncompleteStage(progress: LessonProgress): StageKey {
  for (const key of STAGE_KEYS) {
    if (progress.stages[key].status !== 'completed') return key;
  }
  return STAGE_KEYS[0];
}

export function hasLessonStarted(progress: LessonProgress): boolean {
  return STAGE_KEYS.some((k) => progress.stages[k].status !== 'not-started');
}

export function isLessonFullyComplete(progress: LessonProgress): boolean {
  return STAGE_KEYS.every((k) => progress.stages[k].status === 'completed');
}
