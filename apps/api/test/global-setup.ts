import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

/** Test bazasini noldan yaratadi: sxemani tozalab, migratsiyalarni qo'llaydi */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgres://localhost:5432/muslima_cosmetics_test';
  const client = postgres(url, { max: 1, onnotice: () => {} });
  await client`DROP SCHEMA IF EXISTS public CASCADE`;
  await client`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  await client`CREATE SCHEMA public`;
  await migrate(drizzle(client), { migrationsFolder: new URL('../drizzle', import.meta.url).pathname });
  await client.end();
}
