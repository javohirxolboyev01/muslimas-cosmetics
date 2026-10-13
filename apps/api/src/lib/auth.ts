import { eq } from 'drizzle-orm';
import { jwtVerify, SignJWT } from 'jose';
import type { FastifyRequest } from 'fastify';
import { db } from '../db/client';
import { admins } from '../db/schema';
import { env } from '../env';
import { passwordStamp } from '../services/admin';
import { HttpError } from './errors';

const key = new TextEncoder().encode(env.JWT_SECRET);

export const signToken = (adminId: number, passwordHash: string) =>
  new SignJWT({ pv: passwordStamp(passwordHash) })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(env.JWT_TTL)
    .sign(key);

/**
 * Bearer tokenni tekshirib, admin ID'sini qaytaradi; aks holda 401.
 * Admin o'chirilgan yoki paroli almashgan bo'lsa, eski token ham yaroqsiz.
 */
export async function requireAdmin(req: FastifyRequest): Promise<number> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Avtorizatsiyadan o‘ting');
  let id: number;
  let pv: unknown;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    id = Number(payload.sub);
    pv = payload.pv;
    if (!Number.isInteger(id)) throw new Error('bad sub');
  } catch {
    throw new HttpError(401, 'Sessiya muddati tugagan. Qayta kiring');
  }
  const [admin] = await db.select({ passwordHash: admins.passwordHash }).from(admins).where(eq(admins.id, id));
  if (!admin || pv !== passwordStamp(admin.passwordHash)) throw new HttpError(401, 'Sessiya muddati tugagan. Qayta kiring');
  return id;
}
