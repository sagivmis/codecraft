import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { MemoryRepo } from './db/memory-repo.js';
import type { Repo } from './db/repo.js';
import { bearerAuth } from './middleware/auth.js';
import { progressRoutes } from './routes/progress.js';
import { streaksRoutes } from './routes/streaks.js';

/* Lazy-construct the Postgres repo so the app boots even when the optional
 * `postgres` driver fails to import (e.g. running on Cloudflare Workers where
 * we'd swap to a different driver). */
async function buildRepo(): Promise<Repo> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('[codecraft-api] DATABASE_URL not set — using in-memory repo');
    return new MemoryRepo();
  }
  try {
    const { PostgresRepo } = await import('./db/postgres-repo.js');
    console.log('[codecraft-api] connected to Postgres');
    return new PostgresRepo(url);
  } catch (err) {
    console.error('[codecraft-api] failed to init Postgres, falling back to memory', err);
    return new MemoryRepo();
  }
}

export async function createApp(repo?: Repo) {
  const resolvedRepo = repo ?? (await buildRepo());

  const app = new Hono();

  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: (origin) => {
        const allow = process.env.CORS_ORIGINS?.split(',') ?? ['*'];
        if (allow.includes('*')) return origin ?? '*';
        return allow.includes(origin ?? '') ? origin! : '';
      },
      allowMethods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowHeaders: ['Authorization', 'Content-Type'],
      maxAge: 600,
    }),
  );

  app.get('/', (c) =>
    c.json({
      service: 'codecraft-api',
      version: '0.0.1',
      endpoints: [
        'GET /health',
        'GET /v1/progress',
        'PUT /v1/progress',
        'GET /v1/streaks',
        'PUT /v1/streaks',
      ],
    }),
  );

  app.get('/health', (c) => c.json({ ok: true, service: 'codecraft-api', timestamp: Date.now() }));

  /* All v1 routes require a bearer token. */
  const v1 = new Hono();
  v1.use('*', bearerAuth(resolvedRepo));
  v1.route('/progress', progressRoutes(resolvedRepo));
  v1.route('/streaks', streaksRoutes(resolvedRepo));
  app.route('/v1', v1);

  app.onError((err, c) => {
    console.error('[codecraft-api] unhandled error', err);
    return c.json({ error: 'internal_error', message: err.message }, 500);
  });

  return app;
}

/* Boot when invoked directly. Comparing import.meta.url to argv[1] is
 * fiddly across Windows/Unix and dev tools like tsx, so we just always boot
 * when not in a test environment. Production callers (workers, lambdas)
 * should import { createApp } from this module instead of running it. */
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 8787);
  void createApp().then((app) =>
    serve({ fetch: app.fetch, port }, (info) => {
      console.log(`[codecraft-api] listening on http://localhost:${info.port}`);
    }),
  );
}
