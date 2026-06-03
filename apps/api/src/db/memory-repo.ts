import type { ProgressPayloadDTO, StreakDTO } from '@codecraft/schema';
import { mergeLessonProgress, type Repo } from './repo.js';

/**
 * In-memory Repo used when DATABASE_URL is unset.
 * Useful for local dev, the test suite, and Cloudflare Workers smoke tests.
 * State is process-scoped, so a restart wipes everything — that's fine because
 * the canonical source of truth is the client's localStorage.
 */
export class MemoryRepo implements Repo {
  private users = new Map<string, { hashedDeviceId: string; lastSeen: number }>();
  private progress = new Map<string, ProgressPayloadDTO>();
  private streaks = new Map<string, StreakDTO>();

  async upsertUser(userId: string, hashedDeviceId: string) {
    this.users.set(userId, { hashedDeviceId, lastSeen: Date.now() });
  }

  async getProgress(userId: string): Promise<ProgressPayloadDTO> {
    return this.progress.get(userId) ?? { lessons: {} };
  }

  async mergeProgress(userId: string, incoming: ProgressPayloadDTO) {
    const existing = await this.getProgress(userId);
    const merged = mergeLessonProgress(existing, incoming);
    this.progress.set(userId, merged);
    return merged;
  }

  async getStreak(userId: string) {
    return this.streaks.get(userId) ?? null;
  }

  async saveStreak(userId: string, streak: StreakDTO) {
    /* Prefer the higher `longest` value so we don't accidentally regress. */
    const existing = this.streaks.get(userId);
    const merged: StreakDTO = {
      ...streak,
      longest: Math.max(streak.longest, existing?.longest ?? 0),
    };
    this.streaks.set(userId, merged);
    return merged;
  }
}
