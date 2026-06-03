import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';

/**
 * v1 schema notes:
 *
 * Identities are intentionally lightweight. The web client stores a UUID
 * "device id" in localStorage and sends it as the bearer token. The server
 * upserts a `users` row keyed by that id. When real auth (Clerk, OAuth) is
 * added later, the migration plan is:
 *   - Add `auth_provider` + `auth_subject` columns to `users`.
 *   - Merge anonymous rows into authenticated ones on first sign-in.
 *
 * Progress is stored as one JSONB blob per (user, lesson) pair so we don't
 * have to migrate the schema every time a new stage type is introduced.
 */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  /** Hashed device id (server-side hash of bearer); null until first sync. */
  hashedDeviceId: text('hashed_device_id'),
  /** Optional display name set later. */
  displayName: text('display_name'),
  /** Track preference at sign-up. Optional, can be changed anytime. */
  track: text('track'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
});

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: text('lesson_id').notNull(),
    /** Full LessonProgressDTO; see packages/schema/src/sync.ts. */
    payload: jsonb('payload').notNull(),
    /** Convenience field copied out of payload.updatedAt for indexing. */
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const streaks = pgTable('streaks', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** YYYY-MM-DD. */
  lastActiveDay: text('last_active_day').notNull(),
  current: integer('current').notNull().default(0),
  longest: integer('longest').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
