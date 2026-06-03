import { z } from 'zod';
import { TokenSpecSchema } from './tokens.js';

export const LanguageSchema = z.enum(['js', 'ts', 'python', 'csharp']);
export type Language = z.infer<typeof LanguageSchema>;

export const TierSchema = z.enum(['easy', 'intermediate', 'advanced']);
export type Tier = z.infer<typeof TierSchema>;

export const TrackSchema = z.enum(['kids', 'teens']);
export type Track = z.infer<typeof TrackSchema>;

/* ---------- Stage 0: Hook ---------- */

export const HookStageSchema = z.object({
  kind: z.literal('hook'),
  estimatedSeconds: z.number().int().positive().max(120),
  /** Short copy shown alongside the visual. Variant-aware via the parent variant block. */
  copy: z.string().min(1),
  /** Visual reference - emoji, image path, or animated SVG identifier. */
  visual: z.object({
    kind: z.enum(['emoji', 'image', 'svg']),
    src: z.string().min(1),
    alt: z.string().min(1),
  }),
});
export type HookStage = z.infer<typeof HookStageSchema>;

/* ---------- Stage 1: Animated Walkthrough ---------- */

export const HighlightRangeSchema = z.object({
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  startColumn: z.number().int().positive().optional(),
  endColumn: z.number().int().positive().optional(),
});
export type HighlightRange = z.infer<typeof HighlightRangeSchema>;

export const WalkthroughStepSchema = z.object({
  id: z.string().min(1),
  /** Lines revealed up to this step (1-indexed, inclusive). */
  revealUpToLine: z.number().int().positive(),
  /** Optional ranges to emphasize on this step. */
  highlights: z.array(HighlightRangeSchema).default([]),
  /** Narration / explanation shown alongside the code. */
  explanation: z.string().min(1),
  /** Optional pause-in-narrative milliseconds before advancing if auto-play. */
  pauseMs: z.number().int().nonnegative().optional(),
});
export type WalkthroughStep = z.infer<typeof WalkthroughStepSchema>;

export const WalkthroughStageSchema = z.object({
  kind: z.literal('walkthrough'),
  language: LanguageSchema,
  /** Full source code of the snippet being walked through. */
  code: z.string().min(1),
  steps: z.array(WalkthroughStepSchema).min(1),
  /** A real-world snippet shown at the end as "here's how this is used day-to-day". */
  realWorldSnippet: z.object({
    code: z.string().min(1),
    caption: z.string().min(1),
  }),
});
export type WalkthroughStage = z.infer<typeof WalkthroughStageSchema>;

/* ---------- Stage 1.5: Mini Quiz ---------- */

export const QuizQuestionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('multipleChoice'),
    id: z.string().min(1),
    prompt: z.string().min(1),
    code: z.string().optional(),
    options: z
      .array(z.object({ id: z.string(), label: z.string() }))
      .min(2)
      .max(5),
    correctOptionId: z.string(),
    explanation: z.string().min(1),
  }),
  z.object({
    kind: z.literal('whatPrints'),
    id: z.string().min(1),
    prompt: z.string().min(1),
    code: z.string().min(1),
    expected: z.string().min(1),
    explanation: z.string().min(1),
  }),
]);
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizStageSchema = z.object({
  kind: z.literal('quiz'),
  questions: z.array(QuizQuestionSchema).min(1).max(3),
});
export type QuizStage = z.infer<typeof QuizStageSchema>;

/* ---------- Stage 2: Fix the Bug ---------- */

export const FixTheBugStageSchema = z.object({
  kind: z.literal('fixTheBug'),
  language: LanguageSchema,
  /** Mode: "edit" lets the student edit text; "reorder" lets them drag lines. */
  mode: z.enum(['edit', 'reorder']),
  /** The buggy starting code. */
  buggyCode: z.string().min(1),
  /** The expected correct code (canonical solution). */
  solutionCode: z.string().min(1),
  /**
   * Acceptable alternative solutions or regex patterns that should also pass.
   * Pattern format: { matcher: "exact" | "regex", value: string }
   */
  acceptableSolutions: z
    .array(
      z.object({
        matcher: z.enum(['exact', 'regex', 'normalized']),
        value: z.string().min(1),
        feedback: z.string().optional(),
      }),
    )
    .default([]),
  /** Ordered hint tree, revealed one at a time on request. */
  hints: z.array(z.string().min(1)).min(1).max(5),
  /** Brief explanation of what was wrong, shown after success. */
  postSuccessExplanation: z.string().min(1),
});
export type FixTheBugStage = z.infer<typeof FixTheBugStageSchema>;

/* ---------- Stage 3: Implement ---------- */

export const TestCaseSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  /**
   * JS source that runs after the student's code is loaded. Should use the
   * lightweight expect API exposed by the test runner. Example:
   *   expect(add(2, 3)).toBe(5)
   */
  code: z.string().min(1),
  /** Optional hint surfaced only when this specific test fails. */
  failureHint: z.string().optional(),
  /** Whether to hide the assertion code from the student. */
  hidden: z.boolean().default(false),
});
export type TestCase = z.infer<typeof TestCaseSchema>;

export const ImplementStageSchema = z.object({
  kind: z.literal('implement'),
  language: LanguageSchema,
  taskDescription: z.string().min(1),
  starterCode: z.string(),
  solutionCode: z.string().min(1),
  tests: z.array(TestCaseSchema).min(1),
  hints: z.array(z.string().min(1)).default([]),
});
export type ImplementStage = z.infer<typeof ImplementStageSchema>;
