import { z } from 'zod';
import { CodeKeyboardConfigSchema } from './tokens.js';
import {
  FixTheBugStageSchema,
  HookStageSchema,
  ImplementStageSchema,
  LanguageSchema,
  QuizStageSchema,
  TierSchema,
  WalkthroughStageSchema,
} from './stages.js';

/**
 * A presentation variant for a lesson. The same concepts are taught,
 * but vocabulary, illustrations, and tone differ for the kids vs teens track.
 */
export const VariantContentSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  /** Optional mascot/illustration id, currently only used by the kids variant. */
  illustration: z.string().optional(),
});
export type VariantContent = z.infer<typeof VariantContentSchema>;

export const LessonStagesSchema = z.object({
  hook: HookStageSchema,
  walkthrough: WalkthroughStageSchema,
  quiz: QuizStageSchema,
  fixTheBug: FixTheBugStageSchema,
  implement: ImplementStageSchema,
});
export type LessonStages = z.infer<typeof LessonStagesSchema>;

export const LessonSchema = z.object({
  /** Stable id, kebab-case. Used in URLs and progress tracking. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  language: LanguageSchema,
  tier: TierSchema,
  /** Display ordering within a language. */
  order: z.number().int().nonnegative(),
  concepts: z.array(z.string()).min(1),
  estimatedMinutes: z.number().int().positive().max(60),
  prerequisites: z.array(z.string()).default([]),
  variants: z.object({
    kids: VariantContentSchema,
    teens: VariantContentSchema,
  }),
  stages: LessonStagesSchema,
  codeKeyboard: CodeKeyboardConfigSchema.optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;

/** Helper to author lessons with full type-inference and runtime validation. */
export function defineLesson(lesson: Lesson): Lesson {
  return LessonSchema.parse(lesson);
}
