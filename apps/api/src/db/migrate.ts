import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, sqlClient } from './client';

// src/db/ (dev) yoki dist/ (prod) — ikkalasidan ham apps/api/drizzle topiladi
const here = dirname(fileURLToPath(import.meta.url));
const folder = resolve(here, here.endsWith('dist') ? '../drizzle' : '../../drizzle');

await migrate(db, { migrationsFolder: folder });
console.log('✅ Migratsiyalar qo‘llandi');
await sqlClient.end();
