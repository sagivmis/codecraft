import { useCallback, useSyncExternalStore } from 'react';
import { getLessonById } from '@codecraft/content';
import type { Track } from '@codecraft/schema';

import { STORAGE_KEYS } from '@constants';

import {
  continueLessonPath,
  continueStageLabel,
  findContinueTarget,
  type ContinueTarget,
} from './continue.js';

export type ContinueLessonView = {
  target: ContinueTarget;
  href: string;
  lessonTitle: string;
  stageLabel: string;
};

function readView(track: Track): ContinueLessonView | null {
  const target = findContinueTarget();
  if (!target) return null;
  const lesson = getLessonById(target.lessonId);
  if (!lesson) return null;
  return {
    target,
    href: continueLessonPath(target),
    lessonTitle: lesson.variants[track].title,
    stageLabel: continueStageLabel(target.stageKey),
  };
}

function subscribe(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith(STORAGE_KEYS.PROGRESS_PREFIX)) return;
    onStoreChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener('focus', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('focus', onStoreChange);
  };
}

/**
 * Reactive “continue where you left off” snapshot for the active theme track.
 */
export function useContinueLesson(track: Track): ContinueLessonView | null {
  const getSnapshot = useCallback(() => readView(track), [track]);
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
