import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { eq, ne } from 'drizzle-orm';
import { db } from '../db/client';
import { admins } from '../db/schema';

/**
 * Do'konda bitta admin: uning email va paroli muhit o'zgaruvchilaridan olinadi (ADMIN_EMAIL, ADMIN_PASSWORD).
 * O'zgaruvchi almashtirilsa — keyingi ishga tushishda parol yangilanadi, boshqa email'dagi eski adminlar o'chiriladi.
 * Parol o'zgarmagan bo'lsa xesh qayta yozilmaydi, shuning uchun oddiy qayta deploy sessiyalarni uzmaydi.
 */
export async function syncAdmin(rawEmail: string, password: string, name?: string): Promise<'created' | 'updated' | 'unchanged'> {
  const email = rawEmail.trim().toLowerCase();
  const [current] = await db.select().from(admins).where(eq(admins.email, email));
  let result: 'created' | 'updated' | 'unchanged' = 'unchanged';

  if (!current) {
    await db.insert(admins).values({ email, name: name || 'Admin', passwordHash: await bcrypt.hash(password, 12) });
    result = 'created';
  } else {
    const samePassword = await bcrypt.compare(password, current.passwordHash);
    const newName = name || current.name;
    if (!samePassword || newName !== current.name) {
      const passwordHash = samePassword ? current.passwordHash : await bcrypt.hash(password, 12);
      await db.update(admins).set({ name: newName, passwordHash }).where(eq(admins.id, current.id));
      result = 'updated';
    }
  }

  const removed = await db.delete(admins).where(ne(admins.email, email)).returning({ id: admins.id });
  return removed.length && result === 'unchanged' ? 'updated' : result;
}

/** Token ichidagi parol "izi": parol almashsa, eski tokenlar yaroqsiz bo'ladi. Xeshning o'zi oshkor bo'lmaydi */
export const passwordStamp = (passwordHash: string) => createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16);
