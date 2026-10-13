import { sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { Customer, Paginated } from '@mc/shared';
import { db } from '../../db/client';
import { parse } from '../../lib/errors';
import { likePattern, pageQuery, pageWindow, paginated } from '../../lib/paginate';

const listQuery = pageQuery.extend({
  search: z.string().default(''),
  sort: z.enum(['spent', 'orders', 'recent']).catch('spent'),
});

const ORDER_BY = {
  spent: sql.raw('total_spent DESC, phone'),
  orders: sql.raw('orders_count DESC, phone'),
  recent: sql.raw('last_order_at DESC, phone'),
};

/** Alohida "mijozlar" jadvali yo'q — ular buyurtmalardan telefon raqami bo'yicha yig'iladi */
export const customerAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req): Promise<Paginated<Customer>> => {
    const f = parse(listQuery, req.query);
    const search = f.search.trim() ? likePattern(f.search) : null;

    const base = sql`
      WITH c AS (
        SELECT phone,
               (array_agg(name ORDER BY created_at DESC))[1] AS name,
               (array_agg(region ORDER BY created_at DESC))[1] AS region,
               count(*)::int AS orders_count,
               coalesce(sum(total) FILTER (WHERE status <> 'cancelled'), 0)::int AS total_spent,
               max(created_at) AS last_order_at
        FROM orders GROUP BY phone
      )
      SELECT * FROM c
      ${search ? sql`WHERE name ILIKE ${search} OR phone ILIKE ${search} OR region ILIKE ${search}` : sql``}`;

    const [{ total }] = await db.execute<{ total: number }>(sql`SELECT count(*)::int AS total FROM (${base}) t`);
    const w = pageWindow(total, f.page, f.pageSize);
    const rows = await db.execute<{
      phone: string; name: string; region: string; orders_count: number; total_spent: number; last_order_at: string | Date;
    }>(sql`${base} ORDER BY ${ORDER_BY[f.sort]} LIMIT ${w.limit} OFFSET ${w.offset}`);

    const items = rows.map((r) => ({
      phone: r.phone,
      name: r.name,
      region: r.region,
      ordersCount: r.orders_count,
      totalSpent: r.total_spent,
      lastOrderAt: new Date(r.last_order_at).toISOString(),
    }));
    return paginated(items, total, w, f.pageSize);
  });
};
