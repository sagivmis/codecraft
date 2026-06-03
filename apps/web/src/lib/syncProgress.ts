import { useEffect } from 'react';
import type { LessonProgressDTO, ProgressPayloadDTO, StageProgressDTO } from '@codecraft/schema';

import {
  STAGE_KEYS,
  makeInitialProgress,
  type LessonProgress,
  type StageKey,
  type StageProgress,
  type StageStatus,
} from '../lesson-player/types.js';
import { api } from './apiClient.js';

/**
 * Bridges the client's `LessonProgress` shape (which uses statuses like
 * `not-started` / `attempted`) with the API's `LessonProgressDTO` (which
 * uses `locked` / `available` / `in-progress` / `completed`). The mapping
 * is lossy on the way to the server — we collapse `attempted` to
 * `in-progress` — and is filled back in with reasonable defaults on the
 * way back.
 */

const STORAGE_KEY_PREFIX = 'codecraft.progress.';
const LAST_SYNC_KEY = 'codecraft:last-sync-at';

function storageKey(lessonId: string) {
  return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

function listLocalProgress(): LessonProgress[] {
  if (typeof window === 'undefined') return [];
  const out: LessonProgress[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith(STORAGE_KEY_PREFIX)) continue;
    try {
      const raw = window.localStorage.getItem(k);
      if (!raw) continue;
      out.push(JSON.parse(raw) as LessonProgress);
    } catch {
      /* ignore corrupt entries */
    }
  }
  return out;
}

function toDtoStatus(s: StageStatus): StageProgressDTO['status'] {
  if (s === 'completed') return 'completed';
  if (s === 'in-progress' || s === 'attempted') return 'in-progress';
  return 'available';
}

function fromDtoStatus(s: StageProgressDTO['status']): StageStatus {
  switch (s) {
    case 'completed':
      return 'completed';
    case 'in-progress':
      return 'in-progress';
    case 'available':
    case 'locked':
    default:
      return 'not-started';
  }
}

function toDtoStage(stage: StageProgress, fallbackUpdatedAt: number): StageProgressDTO {
  return {
    status: toDtoStatus(stage.status),
    updatedAt: fallbackUpdatedAt,
    meta: { attempts: stage.attempts, ...(stage.meta ?? {}) },
  };
}

function toDtoLesson(local: LessonProgress): LessonProgressDTO {
  const updatedAt = local.completedAt ?? local.startedAt ?? Date.now();
  const stages: Record<string, StageProgressDTO> = {};
  for (const key of STAGE_KEYS) {
    stages[key] = toDtoStage(local.stages[key], updatedAt);
  }
  return { lessonId: local.lessonId, stages, updatedAt };
}

function toLocalLesson(dto: LessonProgressDTO): LessonProgress {
  const fresh = makeInitialProgress(dto.lessonId);
  for (const key of STAGE_KEYS) {
    const stage = dto.stages[key];
    if (!stage) continue;
    const meta = (stage.meta ?? {}) as Record<string, unknown>;
    fresh.stages[key] = {
      status: fromDtoStatus(stage.status),
      attempts: typeof meta.attempts === 'number' ? meta.attempts : 0,
      meta:
        Object.keys(meta).filter((k) => k !== 'attempts').length > 0
          ? Object.fromEntries(Object.entries(meta).filter(([k]) => k !== 'attempts'))
          : undefined,
    };
  }
  return fresh;
}

function buildPayload(): ProgressPayloadDTO {
  const lessons: Record<string, LessonProgressDTO> = {};
  for (const local of listLocalProgress()) {
    lessons[local.lessonId] = toDtoLesson(local);
  }
  return { lessons };
}

function applyPayload(payload: ProgressPayloadDTO) {
  if (typeof window === 'undefined') return;
  for (const dto of Object.values(payload.lessons)) {
    const local = toLocalLesson(dto);
    window.localStorage.setItem(storageKey(dto.lessonId), JSON.stringify(local));
  }
}

/**
 * Pushes all local progress to the API, applies the merged response back
 * to localStorage, and stores the last-sync timestamp. Safe to call when
 * the API is disabled — it short-circuits cleanly.
 */
export async function syncProgressOnce(): Promise<'disabled' | 'synced' | 'failed'> {
  if (!api.enabled()) return 'disabled';
  const merged = await api.putProgress(buildPayload());
  if (!merged) return 'failed';
  applyPayload(merged);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
  }
  return 'synced';
}

/**
 * Fire a single sync after mount. Quietly no-ops when the API is disabled
 * or offline. We don't poll — every meaningful UI interaction already
 * causes a re-mount of a stage component, and beforeunload would block
 * navigation, so once-per-app-boot is a sensible default for v1.
 */
export function useProgressSync() {
  useEffect(() => {
    let cancelled = false;
    if (!api.enabled()) return;
    /* Defer to idle time so we never compete with the initial render. */
    const t = window.setTimeout(() => {
      if (!cancelled) void syncProgressOnce();
    }, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);
}
