/**
 * HintProvider abstraction.
 *
 * v1: deterministic implementation that returns authored hints from the lesson.
 * v2: LLM-backed implementation can be dropped in without lesson code changes.
 */
export interface HintRequest {
  lessonId: string;
  stage: 'fixTheBug' | 'implement';
  studentCode: string;
  /** How many hints have already been revealed in this attempt. */
  hintsRevealed: number;
  /** Optional failing test ids in stage 3. */
  failingTestIds?: string[];
}

export interface HintResponse {
  hint: string;
  /** True if this was the last available hint. */
  isLast: boolean;
}

export interface HintProvider {
  getHint(request: HintRequest): Promise<HintResponse | null>;
}
