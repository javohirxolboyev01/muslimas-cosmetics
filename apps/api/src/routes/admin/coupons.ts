import { asc, desc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { couponInputSchema, couponPatchSchema, type Coupon } from '@mc/shared';
import { db } from '../../db/client';
import { coupons } from '../../db/schema';
import { HttpError, notFound, parse } from '../../lib/errors';

const pick = ({ code, percent, isActive, usageCount }: typeof coupons.$inferSelect): Coupon => ({ code, percent, isActive, usageCount });

export const couponAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => (await db.select().from(coupons).orderBy(desc(coupons.createdAt), asc(coupons.code))).map(pick));

  app.post('/', async (req, reply) => {
    const input = parse(couponInputSchema, req.body);
    const [row] = await db.insert(coupons).values(input).onConflictDoNothing().returning();
    if (!row) throw new HttpError(409, 'Bunday promokod mavjud', { code: 'Bu kod band' });
    reply.code(201);
    return pick(row);
  });

  app.patch<{ Params: { code: string } }>('/:code', async (req) => {
    const patch = parse(couponPatchSchema, req.body);
    const [row] = await db.update(coupons).set(patch).where(eq(coupons.code, req.params.code)).returning();
    return row ? pick(row) : notFound('Promokod');
  });

  app.delete<{ Params: { code: string } }>('/:code', async (req, reply) => {
    const [row] = await db.delete(coupons).where(eq(coupons.code, req.params.code)).returning({ code: coupons.code });
    if (!row) return notFound('Promokod');
    reply.code(204);
  });
};
