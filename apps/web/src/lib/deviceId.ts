import { STORAGE_KEYS } from '@types';

const STORAGE_KEY = STORAGE_KEYS.DEVICE_ID;

/**
 * Returns a stable per-browser UUID used as the bearer token against the API.
 * Generated lazily on first call. The server hashes this before storing it
 * so the raw id never lands in the database.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && existing.length >= 16) return existing;

  /* `crypto.randomUUID()` is available in every browser we target (it's
   * been baseline since Chrome 92 / Safari 15.4 / Firefox 95). */
  const fresh =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : /* Fallback: 32 random hex chars. */
        Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  window.localStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}
