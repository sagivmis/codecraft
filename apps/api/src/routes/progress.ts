import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ProgressPayloadSchema } from '@codecraft/schema';

import type { Repo } from '../db/repo.js';

export function progressRoutes(repo: Repo) {
  const app = new Hono<{ Variables: { userId: string } }>();

  app.get('/', async (c) => {
    const userId = c.get('userId');
    const progress = await repo.getProgress(userId);
    return c.json(progress);
  });

  app.put('/', zValidator('json', ProgressPayloadSchema), async (c) => {
    const userId = c.get('userId');
    const incoming = c.req.valid('json');
    const merged = await repo.mergeProgress(userId, incoming);
    return c.json(merged);
  });

  return app;
}
