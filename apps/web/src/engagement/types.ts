/**
 * v1 engagement model.
 *
 * Everything lives in localStorage, no server round-trip required. The
 * shapes are mirrored into the @codecraft/schema sync DTOs (StreakDTO) so
 * we can opt-in to backend sync without reshaping the client state.
 */

export type StreakState = {
  /** YYYY-MM-DD (in the user's local time) of the most recent active day. */
  lastActiveDay: string | null;
  /** Consecutive active days ending on `lastActiveDay`. */
  current: number;
  /** All-time longest streak. */
  longest: number;
};

export const EMPTY_STREAK: StreakState = {
  lastActiveDay: null,
  current: 0,
  longest: 0,
};

export type XpEntry = {
  /** Stage keys already awarded XP for, so re-completing doesn't double-count. */
  awardedStages: string[];
  xp: number;
};

export type XpState = {
  total: number;
  perLesson: Record<string, XpEntry>;
};

export const EMPTY_XP: XpState = { total: 0, perLesson: {} };

/** XP awarded for completing each stage. Stays constant for v1. */
export const XP_PER_STAGE = 10;
