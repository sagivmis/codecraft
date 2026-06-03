import type { Lesson } from '@codecraft/schema';
import type { Track } from '@codecraft/schema';
import type { StageKey, StageProgress } from '../types.js';

export type StageResult = {
  status: 'completed' | 'attempted';
  meta?: Record<string, unknown>;
};

export type StageViewProps = {
  lesson: Lesson;
  track: Track;
  stageKey: StageKey;
  progress: StageProgress;
  /** Called when the student finishes (or chooses to skip with `attempted`). */
  onAdvance: (result: StageResult) => void;
  /** Optional callback to record an intermediate update (e.g. "user started watching"). */
  onProgress?: (patch: Partial<StageProgress>) => void;
  /** Lets the student go to the previous stage without changing progress state. */
  onBack: () => void;
};
