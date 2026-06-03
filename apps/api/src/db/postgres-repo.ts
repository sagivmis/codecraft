import { eq } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import type {
  LessonProgressDTO,
  ProgressPayloadDTO,
  StreakDTO,
} from '@codecraft/schema';

import { mergeLessonProgress, type Repo } from './repo.js';
import { lessonProgress, streaks, users } from './schema.js';

/**
 * Production Repo backed by Postgres via Drizzle (postgres-js driver).
 *
 * The driver is wrapped behind this class so the rest of the app stays
 * dialect-agnostic. The merge step does a read-modify-write inside a
 * transaction; with `lesson_progress` keyed by (user_id, lesson_id) that's
 * cheap and avoids needing CRDTs for v1.
 */
export class PostgresRepo implements Repo {
  private db: PostgresJsDatabase;
  private client: ReturnType<typeof postgres>;

  constructor(databaseUrl: string) {
    this.client = postgres(databaseUrl, { max: 5, prepare: false });
    this.db = drizzle(this.client);
  }

  async close() {
    await this.client.end();
  }

  async upsertUser(userId: string, hashedDeviceId: string) {
    await this.db
      .insert(users)
      .values({ id: userId, hashedDeviceId })
      .onConflictDoUpdate({
        target: users.id,
        set: { hashedDeviceId, lastSeenAt: new Date() },
      });
  }

  async getProgress(userId: string): Promise<ProgressPayloadDTO> {
    const rows = await this.db
      .select({ lessonId: lessonProgress.lessonId, payload: lessonProgress.payload })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));

    const lessons: Record<string, LessonProgressDTO> = {};
    for (const row of rows) {
      lessons[row.lessonId] = row.payload as LessonProgressDTO;
    }
    return { lessons };
  }

  async mergeProgress(userId: string, incoming: ProgressPayloadDTO) {
    return this.db.transaction(async (tx) => {
      const existingRows = await tx
        .select({ lessonId: lessonProgress.lessonId, payload: lessonProgress.payload })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, userId));

      const existing: ProgressPayloadDTO = { lessons: {} };
      for (const row of existingRows) {
        existing.lessons[row.lessonId] = row.payload as LessonProgressDTO;
      }

      const merged = mergeLessonProgress(existing, incoming);

      for (const [lessonId, payload] of Object.entries(merged.lessons)) {
        await tx
          .insert(lessonProgress)
          .values({
            userId,
            lessonId,
            payload,
            updatedAt: new Date(payload.updatedAt),
          })
          .onConflictDoUpdate({
            target: [lessonProgress.userId, lessonProgress.lessonId],
            set: { payload, updatedAt: new Date(payload.updatedAt) },
          });
      }

      return merged;
    });
  }

  async getStreak(userId: string): Promise<StreakDTO | null> {
    const [row] = await this.db
      .select()
      .from(streaks)
      .where(eq(streaks.userId, userId))
      .limit(1);
    if (!row) return null;
    return { lastActiveDay: row.lastActiveDay, current: row.current, longest: row.longest };
  }

  async saveStreak(userId: string, streak: StreakDTO) {
    const existing = await this.getStreak(userId);
    const merged: StreakDTO = {
      ...streak,
      longest: Math.max(streak.longest, existing?.longest ?? 0),
    };
    await this.db
      .insert(streaks)
      .values({
        userId,
        lastActiveDay: merged.lastActiveDay,
        current: merged.current,
        longest: merged.longest,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: streaks.userId,
        set: {
          lastActiveDay: merged.lastActiveDay,
          current: merged.current,
          longest: merged.longest,
          updatedAt: new Date(),
        },
      });
    return merged;
  }
}

