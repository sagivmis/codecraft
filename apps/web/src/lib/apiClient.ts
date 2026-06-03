import type { ProgressPayloadDTO, StreakDTO } from '@codecraft/schema';

import { API_URL } from '@constants';

import { getDeviceId } from './deviceId.js';

/**
 * Thin fetch wrapper for the optional CodeCraft API.
 *
 * The web app is fully usable without a backend — every method here returns
 * `null` when `VITE_API_URL` is not configured, so callers can use the same
 * code path in both modes.
 */
function isEnabled() {
  return Boolean(API_URL);
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  if (!API_URL) return null;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${getDeviceId()}`);
  if (init.body) headers.set('Content-Type', 'application/json');

  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, headers });
    if (!res.ok) {
      console.warn(`[codecraft] API ${path} -> ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[codecraft] API ${path} failed`, err);
    return null;
  }
}

export const api = {
  enabled: isEnabled,

  getProgress(): Promise<ProgressPayloadDTO | null> {
    return call<ProgressPayloadDTO>('/v1/progress');
  },

  putProgress(payload: ProgressPayloadDTO): Promise<ProgressPayloadDTO | null> {
    return call<ProgressPayloadDTO>('/v1/progress', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  getStreak(): Promise<{ streak: StreakDTO | null } | null> {
    return call<{ streak: StreakDTO | null }>('/v1/streaks');
  },

  putStreak(payload: StreakDTO): Promise<{ streak: StreakDTO } | null> {
    return call<{ streak: StreakDTO }>('/v1/streaks', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
