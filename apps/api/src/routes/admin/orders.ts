import { and, count, desc, eq, ilike, or, sql, type SQL } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DELIVERY_METHODS, ORDER_STATUSES, orderPatchSchema, type Order, type Paginated } from '@mc/shared';
import { db } from '../../db/client';
import { orders } from '../../db/schema';
import { notFound, parse } from '../../lib/errors';
import { toOrder } from '../../lib/mappers';
import { likePattern, pageQuery, pageWindow, paginated } from '../../lib/paginate';
import { updateOrder } from '../../services/orders';

const listQuery = pageQuery.extend({
  search: z.string().default(''),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  delivery: z.enum(DELIVERY_METHODS).optional().catch(undefined),
});

export const orderAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req): Promise<Paginated<Order>> => {
    const f = parse(listQuery, req.query);
    const where: (SQL | undefined)[] = [];
    if (f.status) where.push(eq(orders.status, f.status));
    if (f.delivery) where.push(eq(orders.delivery, f.delivery));
    if (f.search.trim()) {
      const p = likePattern(f.search);
      const digits = f.search.replace(/\D/g, '');
      where.push(
        or(
          ilike(orders.no, p),
          ilike(orders.name, p),
          digits.length >= 3 ? sql`regexp_replace(${orders.phone}, '\\D', '', 'g') LIKE ${`%${digits}%`}` : undefined,
        ),
      );
    }
    const cond = and(...where);
    const [{ total }] = await db.select({ total: count() }).from(orders).where(cond);
    const w = pageWindow(total, f.page, f.pageSize);
    const rows = await db.select().from(orders).where(cond).orderBy(desc(orders.createdAt)).limit(w.limit).offset(w.offset);
    return paginated(rows.map(toOrder), total, w, f.pageSize);
  });

  app.get('/status-counts', async () => {
    const rows = await db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status);
    return Object.fromEntries(rows.map((r) => [r.status, r.n]));
  });

  app.get<{ Params: { no: string } }>('/:no', async (req) => {
    const [row] = await db.select().from(orders).where(eq(orders.no, req.params.no));
    return row ? toOrder(row) : notFound('Buyurtma');
  });

  app.patch<{ Params: { no: string } }>('/:no', async (req) => updateOrder(db, req.params.no, parse(orderPatchSchema, req.body)));
};
