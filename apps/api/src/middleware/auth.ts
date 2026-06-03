import { createHash } from 'node:crypto';
import type { MiddlewareHandler } from 'hono';

import type { Repo } from '../db/repo.js';

/**
 * Anonymous bearer-token auth.
 *
 * Clients generate a UUID v4 once (stored in localStorage) and send it as
 * `Authorization: Bearer <uuid>`. The server derives a stable user id from
 * the bearer via SHA-256 — that way the raw device id never lands in the
 * database, and the user id is a fixed-length opaque string.
 *
 * When real auth is added (Clerk, OAuth) the same shape can be preserved:
 * a verified JWT subject is hashed the same way and existing rows continue
 * to work as anonymous "shadow" accounts that can later be linked.
 */
const AUTH_PREFIX = 'Bearer ';
const MIN_TOKEN_LEN = 16;

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export function bearerAuth(repo: Repo): MiddlewareHandler {
  return async (c, next) => {
    const header = c.req.header('authorization') ?? c.req.header('Authorization');
    if (!header || !header.startsWith(AUTH_PREFIX)) {
      return c.json({ error: 'missing_bearer_token' }, 401);
    }
    const raw = header.slice(AUTH_PREFIX.length).trim();
    if (raw.length < MIN_TOKEN_LEN) {
      return c.json({ error: 'invalid_bearer_token' }, 401);
    }

    const hashed = createHash('sha256').update(raw).digest('hex');
    const userId = `anon_${hashed.slice(0, 24)}`;
    /* Fire-and-forget upsert so the route handler doesn't block on it. We
     * still await inside upsertUser to honor any DB errors via the global
     * handler. */
    await repo.upsertUser(userId, hashed);
    c.set('userId', userId);
    await next();
  };
}
