import { useCallback, useEffect, useState } from 'react';
import type { Track } from '@codecraft/schema';

const STORAGE_KEY = 'codecraft:onboarding:v1';

export type OnboardingState = {
  /** True once the student has picked a track (or explicitly skipped). */
  completed: boolean;
  /** Stored age bucket, used to default the track on subsequent visits. */
  ageBucket: 'under-13' | '13-plus' | 'unknown';
  /** The track they picked or were defaulted to. */
  track: Track;
};

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  ageBucket: 'unknown',
  track: 'teens',
};

function read(): OnboardingState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    return {
      completed: Boolean(parsed.completed),
      ageBucket: parsed.ageBucket ?? 'unknown',
      track: parsed.track === 'kids' || parsed.track === 'teens' ? parsed.track : 'teens',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function write(state: OnboardingState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Lightweight hook that tracks the first-run onboarding state.
 * Persists to localStorage and is the single source of truth for whether
 * the landing page should show the welcome modal.
 */
export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);

  /* Defer reading from localStorage until after first paint to avoid an
   * SSR/CSR mismatch (we deploy as a static SPA so this is mostly future-
   * proofing) and to keep the initial bundle non-blocking. */
  useEffect(() => {
    setState(read());
  }, []);

  const complete = useCallback((next: Omit<OnboardingState, 'completed'>) => {
    const value: OnboardingState = { ...next, completed: true };
    write(value);
    setState(value);
  }, []);

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    setState(DEFAULT_STATE);
  }, []);

  return { state, complete, reset };
}
