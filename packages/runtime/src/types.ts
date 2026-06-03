import type { TestCase, Language } from '@codecraft/schema';

export type TestRunRequest = {
  language: Language;
  studentCode: string;
  tests: TestCase[];
  /** Per-test timeout in ms; default 2000. */
  timeoutMs?: number;
};

export type TestOutcome = {
  testId: string;
  passed: boolean;
  message?: string;
  consoleLog?: string[];
  durationMs: number;
};

export type TestRunResult = {
  outcomes: TestOutcome[];
  /** True iff every test passed. */
  allPassed: boolean;
  /** Wall-clock time for the entire run. */
  totalDurationMs: number;
};
