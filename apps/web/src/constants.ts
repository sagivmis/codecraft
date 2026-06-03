/**
 * Centralized constants for @codecraft/web.
 *
 * Imported via the `@constants` path alias (configured in tsconfig.json +
 * vite.config.ts). Grouped by concern so adding a new constant has an
 * obvious home.
 */

// ----------------------------------------------------------------------------
// localStorage keys
// ----------------------------------------------------------------------------
// Convention: `codecraft:<feature>:<key>:v<n>`. The two legacy keys still use
// `.` separators (codecraft.progress.<lessonId>) and are kept that way so we
// don't invalidate existing students' progress on upgrade.
export const STORAGE_KEYS = {
  /** Prefix for per-lesson progress blobs (legacy `.` format). */
  PROGRESS_PREFIX: 'codecraft.progress.',
  ONBOARDING: 'codecraft:onboarding:v1',
  DEVICE_ID: 'codecraft:device-id:v1',
  LAST_SYNC_AT: 'codecraft:last-sync-at',
  STREAK: 'codecraft:engagement:streak:v1',
  XP: 'codecraft:engagement:xp:v1',
  PWA_INSTALL_DISMISSED: 'codecraft:pwa-install:dismissed-at',
} as const;

// ----------------------------------------------------------------------------
// Engagement / scoring
// ----------------------------------------------------------------------------
export const XP_PER_STAGE = 10;
export const STAGES_PER_LESSON = 5;

// ----------------------------------------------------------------------------
// Timings (all milliseconds unless noted)
// ----------------------------------------------------------------------------
export const PWA_INSTALL_DISMISS_COOLDOWN_DAYS = 7;
/** How long a press counts as a "long press" on TokenButton variants. */
export const LONG_PRESS_MS = 450;
/** Delay before progress sync fires after app boot, so we don't compete with render. */
export const PROGRESS_SYNC_DEFER_MS = 1500;
/** Hard wall-clock cap for student test runs. */
export const TEST_RUN_TIMEOUT_MS = 4000;
/** Default auto-advance delay between walkthrough steps. */
export const WALKTHROUGH_AUTOPLAY_MS = 4500;

// ----------------------------------------------------------------------------
// Monaco editor sizing
// ----------------------------------------------------------------------------
export const EDITOR_LINE_HEIGHT_PX = 22;
export const EDITOR_MIN_HEIGHT_PX = 160;
export const EDITOR_MAX_HEIGHT_PX = 480;

// ----------------------------------------------------------------------------
// Display labels
// ----------------------------------------------------------------------------
export const TIER_LABELS = {
  easy: 'Easy',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

export const LANG_LABELS = {
  js: 'JavaScript',
  ts: 'TypeScript',
  python: 'Python',
  csharp: 'C#',
} as const;

// ----------------------------------------------------------------------------
// Celebration confetti palette
// ----------------------------------------------------------------------------
export const CELEBRATION_PARTICLE_COLORS = [
  '#f97316',
  '#22c55e',
  '#6366f1',
  '#eab308',
  '#ec4899',
] as const;

// ----------------------------------------------------------------------------
// API
// ----------------------------------------------------------------------------
/** Trimmed VITE_API_URL with trailing slash removed. Empty string = disabled. */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
