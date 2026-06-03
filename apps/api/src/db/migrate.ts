/**
 * Applies Drizzle migrations from ./drizzle to the database pointed to by
 * DATABASE_URL. Run with `pnpm --filter @codecraft/api db:migrate`.
 *
 * Safe to run multiple times — migrate() is idempotent. Exits non-zero if
 * DATABASE_URL is unset so CI doesn't silently no-op.
 */
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: './drizzle' });
  await client.end();
  console.log('✓ migrations applied');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
