import { getAllLessons } from '@codecraft/content';

import {
  firstIncompleteStage,
  hasLessonStarted,
  isLessonFullyComplete,
  readLessonProgress,
} from './progress.js';
import { STAGE_LABELS, type StageKey } from './types.js';

export type ContinueTarget = {
  lessonId: string;
  stageKey: StageKey;
};

/**
 * First lesson (curriculum order) that was started but not fully completed,
 * plus the earliest incomplete stage in that lesson.
 */
export function findContinueTarget(): ContinueTarget | null {
  const lessons = getAllLessons();
  for (const lesson of lessons) {
    const progress = readLessonProgress(lesson.id);
    if (!progress || !hasLessonStarted(progress) || isLessonFullyComplete(progress)) {
      continue;
    }
    return { lessonId: lesson.id, stageKey: firstIncompleteStage(progress) };
  }
  return null;
}

export function continueLessonPath(target: ContinueTarget): string {
  return `/lessons/${target.lessonId}/${target.stageKey}`;
}

export function continueStageLabel(stageKey: StageKey): string {
  return STAGE_LABELS[stageKey];
}
