import { z } from 'zod';

/**
 * Sync DTOs shared between the web client and the API.
 *
 * The web app is offline-first: lesson progress is the source of truth in
 * localStorage. When a `VITE_API_URL` is configured, the client opportunistically
 * pushes its progress to the API and pulls any newer remote state on app boot.
 * Conflict resolution is last-writer-wins per stage, scoped by `updatedAt`.
 */

export const StageStatusSchema = z.enum(['locked', 'available', 'in-progress', 'completed']);

export const StageProgressSchema = z.object({
  status: StageStatusSchema,
  /** Unix millis when the stage was last touched. */
  updatedAt: z.number().int().nonnegative(),
  /** Optional per-stage stats; format is intentionally open-ended. */
  meta: z.record(z.string(), z.unknown()).optional(),
});
export type StageProgressDTO = z.infer<typeof StageProgressSchema>;

export const LessonProgressSchema = z.object({
  lessonId: z.string().min(1),
  stages: z.record(z.string(), StageProgressSchema),
  updatedAt: z.number().int().nonnegative(),
});
export type LessonProgressDTO = z.infer<typeof LessonProgressSchema>;

export const ProgressPayloadSchema = z.object({
  /** Per-lesson progress, keyed by lesson id. */
  lessons: z.record(z.string(), LessonProgressSchema),
});
export type ProgressPayloadDTO = z.infer<typeof ProgressPayloadSchema>;

export const StreakSchema = z.object({
  /** YYYY-MM-DD (in the user's local time) of the most recent active day. */
  lastActiveDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** Consecutive active days ending on `lastActiveDay`. */
  current: z.number().int().nonnegative(),
  /** All-time longest streak. */
  longest: z.number().int().nonnegative(),
});
export type StreakDTO = z.infer<typeof StreakSchema>;

export const SyncEnvelopeSchema = z.object({
  /** ISO-8601 of when the client built this envelope. */
  clientTimestamp: z.string().datetime(),
  progress: ProgressPayloadSchema,
  streak: StreakSchema.nullable(),
});
export type SyncEnvelopeDTO = z.infer<typeof SyncEnvelopeSchema>;
