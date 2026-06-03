import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { StreakSchema } from '@codecraft/schema';

import type { Repo } from '../db/repo.js';

export function streaksRoutes(repo: Repo) {
  const app = new Hono<{ Variables: { userId: string } }>();

  app.get('/', async (c) => {
    const userId = c.get('userId');
    const streak = await repo.getStreak(userId);
    return c.json({ streak });
  });

  app.put('/', zValidator('json', StreakSchema), async (c) => {
    const userId = c.get('userId');
    const incoming = c.req.valid('json');
    const merged = await repo.saveStreak(userId, incoming);
    return c.json({ streak: merged });
  });

  return app;
}
