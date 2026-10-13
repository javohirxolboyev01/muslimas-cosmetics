/**
 * Boshlang'ich ma'lumotlar. Takroriy ishga tushirish xavfsiz:
 *  - toifa/mahsulot/promokod/sozlamalar faqat jadval bo'sh bo'lsa qo'shiladi;
 *  - admin foydalanuvchi ADMIN_EMAIL bo'yicha yaratiladi yoki paroli yangilanadi;
 *  - `--demo` bilan buyurtmalar jadvali bo'sh bo'lsa 64 ta demo buyurtma qo'shiladi.
 */
import bcrypt from 'bcryptjs';
import { count, sql } from 'drizzle-orm';
import { db, sqlClient } from './client';
import { admins, categories, coupons, orders, products } from './schema';
import { seedCategories, seedOrders, seedProducts } from './seed-data';
import { DEFAULT_SETTINGS, saveSettings } from '../services/settings';

const withDemo = process.argv.includes('--demo');
const now = Date.now();

const isEmpty = async (table: typeof categories | typeof products | typeof coupons | typeof orders) =>
  (await db.select({ n: count() }).from(table))[0].n === 0;

if (await isEmpty(categories)) {
  // createdAt ketma-ket — saytdagi tartib saqlanadi
  await db.insert(categories).values(seedCategories.map((c, i) => ({ ...c, createdAt: new Date(now + i * 1000) })));
  console.log(`✓ ${seedCategories.length} ta toifa`);
}

const demoProducts = seedProducts(now);
if (await isEmpty(products)) {
  await db.insert(products).values(demoProducts.map((p) => ({ ...p, createdAt: new Date(p.createdAt) })));
  // serial ketma-ketligini qo'lda berilgan ID'lardan keyinga suramiz
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT max(id) FROM products))`);
  console.log(`✓ ${demoProducts.length} ta mahsulot`);
}

if (await isEmpty(coupons)) {
  await db.insert(coupons).values([
    { code: 'GLOW15', percent: 15, isActive: true, usageCount: 0 },
    { code: 'BAHOR10', percent: 10, isActive: false, usageCount: 0 },
  ]);
  console.log('✓ promokodlar');
}

const [hasSettings] = await db.execute<{ n: number }>(sql`SELECT count(*)::int AS n FROM settings`);
if (!hasSettings.n) {
  await saveSettings(db, DEFAULT_SETTINGS);
  console.log('✓ sozlamalar');
}

const email = (process.env.ADMIN_EMAIL ?? 'admin@muslima.uz').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? 'admin123';
const name = process.env.ADMIN_NAME ?? 'Admin';
const passwordHash = await bcrypt.hash(password, 12);
await db
  .insert(admins)
  .values({ email, name, passwordHash })
  .onConflictDoUpdate({ target: admins.email, set: { passwordHash, name } });
console.log(`✓ admin: ${email}`);

if (withDemo && (await isEmpty(orders))) {
  const list = seedOrders(demoProducts, now);
  await db.insert(orders).values(
    list.map(({ date, adminNote, ...o }) => ({ ...o, createdAt: new Date(date), adminNote: adminNote ?? '' })),
  );
  console.log(`✓ ${list.length} ta demo buyurtma`);
}

await sqlClient.end();
console.log('✅ Seed tugadi');
