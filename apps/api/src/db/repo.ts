import type { LessonProgressDTO, ProgressPayloadDTO, StreakDTO } from '@codecraft/schema';

/**
 * Abstraction over the storage layer so the routes don't import a specific
 * Drizzle dialect. Two implementations are provided:
 *
 *   - PostgresRepo (production / Neon)
 *   - MemoryRepo   (local dev when DATABASE_URL is missing)
 *
 * Both implementations are stateless across requests; correctness only
 * requires per-user serialization of writes, which `lessonId` already gives us.
 */
export interface Repo {
  upsertUser(userId: string, hashedDeviceId: string): Promise<void>;

  getProgress(userId: string): Promise<ProgressPayloadDTO>;

  /**
   * Merge the supplied progress with whatever is currently stored. Per-lesson
   * conflict resolution is last-writer-wins by `updatedAt`. Returns the
   * merged state so the client can reconcile.
   */
  mergeProgress(userId: string, incoming: ProgressPayloadDTO): Promise<ProgressPayloadDTO>;

  getStreak(userId: string): Promise<StreakDTO | null>;
  saveStreak(userId: string, streak: StreakDTO): Promise<StreakDTO>;
}

/**
 * Pure-functional merge helper, exported for tests and shared between the
 * memory and postgres repos.
 */
export function mergeLessonProgress(
  existing: ProgressPayloadDTO,
  incoming: ProgressPayloadDTO,
): ProgressPayloadDTO {
  const out: Record<string, LessonProgressDTO> = { ...existing.lessons };
  for (const [id, incomingLesson] of Object.entries(incoming.lessons)) {
    const current = out[id];
    if (!current || incomingLesson.updatedAt > current.updatedAt) {
      out[id] = incomingLesson;
    } else if (incomingLesson.updatedAt === current.updatedAt) {
      /* Stages are independent — merge by per-stage updatedAt so two
       * devices working on the same lesson don't clobber each other. */
      const stages = { ...current.stages };
      for (const [stageKey, stage] of Object.entries(incomingLesson.stages)) {
        const existingStage = stages[stageKey];
        if (!existingStage || stage.updatedAt > existingStage.updatedAt) {
          stages[stageKey] = stage;
        }
      }
      out[id] = { ...current, stages };
    }
  }
  return { lessons: out };
}
