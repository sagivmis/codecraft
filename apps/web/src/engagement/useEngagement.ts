import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { XP_PER_STAGE } from '@types';

import {
  daysBetween,
  readStreak,
  readXp,
  todayKey,
  writeStreak,
  writeXp,
} from './storage.js';
import { EMPTY_STREAK, EMPTY_XP, type StreakState, type XpState } from './types.js';

/**
 * Lightweight pub/sub so all engagement-aware components in the app see
 * the same state, with cross-tab consistency via the `storage` event.
 */
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/* useSyncExternalStore wants stable snapshots. We cache the last read so
 * React doesn't bail out / infinite-loop on object-identity changes. */
let streakCache: StreakState = EMPTY_STREAK;
let xpCache: XpState = EMPTY_XP;
let initialized = false;

function ensureInit() {
  if (initialized || typeof window === 'undefined') return;
  streakCache = readStreak();
  xpCache = readXp();
  initialized = true;
}

function getStreakSnapshot(): StreakState {
  ensureInit();
  return streakCache;
}

function getXpSnapshot(): XpState {
  ensureInit();
  return xpCache;
}

function getServerSnapshot(): StreakState {
  return EMPTY_STREAK;
}

function getXpServerSnapshot(): XpState {
  return EMPTY_XP;
}

/** Read the current streak. Updates across tabs and components. */
export function useStreak(): StreakState {
  return useSyncExternalStore(subscribe, getStreakSnapshot, getServerSnapshot);
}

/** Read the current XP totals. Updates across tabs and components. */
export function useXp(): XpState {
  return useSyncExternalStore(subscribe, getXpSnapshot, getXpServerSnapshot);
}

/** True if the student's last active day was today. */
export function isStreakActiveToday(s: StreakState): boolean {
  return s.lastActiveDay === todayKey();
}

/**
 * Bump the streak counter to reflect activity today.
 *
 *   - First-ever activity: start at 1.
 *   - Same day as last activity: no-op (idempotent for the same calendar day).
 *   - Exactly the next day: increment current.
 *   - More than one day gap: reset to 1 (streak broken).
 *
 * Returns the new state plus a `delta` describing what happened, useful for
 * triggering UI feedback ("you started a streak!", "+1 day!").
 */
export function recordStreakActivity(): {
  state: StreakState;
  delta: 'unchanged' | 'started' | 'incremented' | 'reset';
} {
  ensureInit();
  const today = todayKey();
  const prev = streakCache;
  if (prev.lastActiveDay === today) {
    return { state: prev, delta: 'unchanged' };
  }
  let delta: 'unchanged' | 'started' | 'incremented' | 'reset' = 'started';
  let current = 1;
  if (prev.lastActiveDay) {
    const gap = daysBetween(prev.lastActiveDay, today);
    if (gap === 1) {
      current = prev.current + 1;
      delta = 'incremented';
    } else if (gap > 1) {
      current = 1;
      delta = 'reset';
    } else {
      /* gap === 0 was handled above; negative gaps mean clock skew so we
       * leave the streak alone and just refresh the last-active day. */
      current = Math.max(prev.current, 1);
      delta = 'unchanged';
    }
  }
  const next: StreakState = {
    lastActiveDay: today,
    current,
    longest: Math.max(prev.longest, current),
  };
  streakCache = next;
  writeStreak(next);
  notify();
  return { state: next, delta };
}

/**
 * Award XP for completing one stage of a lesson. Idempotent per
 * (lessonId, stageKey) — re-completing the same stage doesn't double-award.
 *
 * Returns the amount of XP newly granted (0 if this stage was already
 * counted), so callers can play a "+10 XP" animation.
 */
export function awardStageXp(lessonId: string, stageKey: string): { granted: number; total: number } {
  ensureInit();
  const prev = xpCache;
  const entry = prev.perLesson[lessonId] ?? { awardedStages: [], xp: 0 };
  if (entry.awardedStages.includes(stageKey)) {
    return { granted: 0, total: prev.total };
  }
  const updatedEntry = {
    awardedStages: [...entry.awardedStages, stageKey],
    xp: entry.xp + XP_PER_STAGE,
  };
  const next: XpState = {
    total: prev.total + XP_PER_STAGE,
    perLesson: { ...prev.perLesson, [lessonId]: updatedEntry },
  };
  xpCache = next;
  writeXp(next);
  notify();
  return { granted: XP_PER_STAGE, total: next.total };
}

/**
 * Hook returning a stable `recordActivity` callback that bumps the streak
 * AND awards XP in one call. Suitable for wiring into `markStage` in the
 * lesson player.
 */
export function useEngagement() {
  const streak = useStreak();
  const xp = useXp();

  const completeStage = useCallback((lessonId: string, stageKey: string) => {
    const xpResult = awardStageXp(lessonId, stageKey);
    const streakResult = recordStreakActivity();
    return { xp: xpResult, streak: streakResult };
  }, []);

  /* Recompute the cache on focus in case another tab modified it (the
   * storage event already covers cross-tab, but BFcache restores or
   * locked-screen wakes can miss it). */
  useEffect(() => {
    const refresh = () => {
      streakCache = readStreak();
      xpCache = readXp();
      notify();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  return { streak, xp, completeStage };
}
