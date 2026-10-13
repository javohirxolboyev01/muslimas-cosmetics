import { jwtVerify, SignJWT } from 'jose';
import type { FastifyRequest } from 'fastify';
import { env } from '../env';
import { HttpError } from './errors';

const key = new TextEncoder().encode(env.JWT_SECRET);

export const signToken = (adminId: number) =>
  new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(String(adminId)).setIssuedAt().setExpirationTime(env.JWT_TTL).sign(key);

/** Bearer tokenni tekshirib, admin ID'sini qaytaradi; aks holda 401 */
export async function requireAdmin(req: FastifyRequest): Promise<number> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Avtorizatsiyadan o‘ting');
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) throw new Error('bad sub');
    return id;
  } catch {
    throw new HttpError(401, 'Sessiya muddati tugagan. Qayta kiring');
  }
}
