import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/health', (c) => c.json({ ok: true, service: 'codecraft-api', timestamp: Date.now() }));

app.get('/', (c) =>
  c.json({
    service: 'codecraft-api',
    docs: 'See README. Endpoints: /health, /progress (todo), /streaks (todo).',
  }),
);

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`[codecraft-api] listening on http://localhost:${info.port}`);
});

export default app;
