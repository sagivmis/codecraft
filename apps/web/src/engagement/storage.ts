import { STORAGE_KEYS } from '@types';

import { EMPTY_STREAK, EMPTY_XP, type StreakState, type XpState } from './types.js';

const STREAK_KEY = STORAGE_KEYS.STREAK;
const XP_KEY = STORAGE_KEYS.XP;

/** YYYY-MM-DD in the user's LOCAL timezone (not UTC). */
export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Difference in calendar days between two YYYY-MM-DD keys (a < b → positive). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number) as [number, number, number];
  const [by, bm, bd] = b.split('-').map(Number) as [number, number, number];
  const aDate = new Date(ay, am - 1, ad).getTime();
  const bDate = new Date(by, bm - 1, bd).getTime();
  return Math.round((bDate - aDate) / 86_400_000);
}

export function readStreak(): StreakState {
  if (typeof window === 'undefined') return EMPTY_STREAK;
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return EMPTY_STREAK;
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      lastActiveDay: parsed.lastActiveDay ?? null,
      current: typeof parsed.current === 'number' ? parsed.current : 0,
      longest: typeof parsed.longest === 'number' ? parsed.longest : 0,
    };
  } catch {
    return EMPTY_STREAK;
  }
}

export function writeStreak(state: StreakState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(state));
}

export function readXp(): XpState {
  if (typeof window === 'undefined') return EMPTY_XP;
  try {
    const raw = window.localStorage.getItem(XP_KEY);
    if (!raw) return EMPTY_XP;
    const parsed = JSON.parse(raw) as Partial<XpState>;
    return {
      total: typeof parsed.total === 'number' ? parsed.total : 0,
      perLesson: parsed.perLesson ?? {},
    };
  } catch {
    return EMPTY_XP;
  }
}

export function writeXp(state: XpState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(XP_KEY, JSON.stringify(state));
}
