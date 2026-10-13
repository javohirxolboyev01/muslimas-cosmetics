import { and, asc, desc, eq, lte, sql } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { LOW_STOCK_LIMIT, type OrderStatus } from '@mc/shared';
import { db } from '../../db/client';
import { orders, products } from '../../db/schema';
import { env } from '../../env';
import { parse } from '../../lib/errors';
import { toOrder, toProduct } from '../../lib/mappers';

const query = z.object({ days: z.coerce.number().refine((n) => [7, 30, 90].includes(n)).catch(7) });

export const dashboardAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req) => {
    const { days } = parse(query, req.query);
    const tz = env.SHOP_TZ;

    // Davr chegaralari do'kon vaqt mintaqasidagi kun boshidan hisoblanadi
    const [{ fromTs, prevFromTs }] = await db.execute<{ fromTs: Date; prevFromTs: Date }>(sql`
      SELECT (date_trunc('day', now() AT TIME ZONE ${tz}) - make_interval(days => ${days - 1})) AT TIME ZONE ${tz} AS "fromTs",
             (date_trunc('day', now() AT TIME ZONE ${tz}) - make_interval(days => ${2 * days - 1})) AT TIME ZONE ${tz} AS "prevFromTs"`);
    // drizzle raw SQL'da Date parametr sifatida o'tmaydi — ISO satr + ::timestamptz
    const from = sql`${new Date(fromTs).toISOString()}::timestamptz`;
    const prevFrom = sql`${new Date(prevFromTs).toISOString()}::timestamptz`;

    const [totals] = await db.execute<{
      revenue: number; revenue_prev: number; orders: number; orders_prev: number; paid: number; customers: number;
    }>(sql`
      SELECT
        coalesce(sum(total) FILTER (WHERE created_at >= ${from} AND status <> 'cancelled'), 0)::int AS revenue,
        coalesce(sum(total) FILTER (WHERE created_at < ${from} AND status <> 'cancelled'), 0)::int AS revenue_prev,
        count(*) FILTER (WHERE created_at >= ${from})::int AS orders,
        count(*) FILTER (WHERE created_at < ${from})::int AS orders_prev,
        count(*) FILTER (WHERE created_at >= ${from} AND status <> 'cancelled')::int AS paid,
        count(DISTINCT phone) FILTER (WHERE created_at >= ${from})::int AS customers
      FROM orders WHERE created_at >= ${prevFrom}`);

    const series = await db.execute<{ date: string; revenue: number; orders: number }>(sql`
      WITH d AS (
        SELECT generate_series(date_trunc('day', ${from} AT TIME ZONE ${tz}),
                               date_trunc('day', now() AT TIME ZONE ${tz}), interval '1 day') AS day
      )
      SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
             coalesce(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0)::int AS revenue,
             count(o.no)::int AS orders
      FROM d LEFT JOIN orders o ON date_trunc('day', o.created_at AT TIME ZONE ${tz}) = d.day
      GROUP BY d.day ORDER BY d.day`);

    const statusRows = await db.execute<{ status: OrderStatus; n: number }>(sql`
      SELECT status, count(*)::int AS n FROM orders WHERE created_at >= ${from} GROUP BY status`);

    const topProducts = await db.execute<{ productId: number; name: string; qty: number; revenue: number }>(sql`
      SELECT (it->>'productId')::int AS "productId",
             (array_agg(it->>'name'))[1] AS name,
             sum((it->>'qty')::int)::int AS qty,
             sum((it->>'qty')::int * (it->>'price')::int)::int AS revenue
      FROM orders, jsonb_array_elements(items) AS it
      WHERE created_at >= ${from} AND status <> 'cancelled'
      GROUP BY 1 ORDER BY revenue DESC LIMIT 5`);

    const lowStock = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), lte(products.stock, LOW_STOCK_LIMIT)))
      .orderBy(asc(products.stock), asc(products.id))
      .limit(6);

    const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6);

    return {
      days,
      revenue: totals.revenue,
      revenuePrev: totals.revenue_prev,
      orders: totals.orders,
      ordersPrev: totals.orders_prev,
      avgOrder: totals.paid ? Math.round(totals.revenue / totals.paid) : 0,
      customers: totals.customers,
      series: [...series],
      statusCounts: Object.fromEntries(statusRows.map((r) => [r.status, r.n])),
      topProducts: [...topProducts],
      lowStock: lowStock.map(toProduct),
      recentOrders: recent.map(toOrder),
    };
  });
};
