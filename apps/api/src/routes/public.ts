import { and, asc, desc, eq, ilike, inArray, isNotNull, or, sql, type SQL } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  createOrderSchema, formatPhone, orderLookupSchema, REGIONS, SKIN_TYPES,
  type CouponCheck, type PublicCategory, type PublicOrder, type PublicProduct,
} from '@mc/shared';
import { db } from '../db/client';
import { categories, coupons, orders, products } from '../db/schema';
import { HttpError, notFound, parse } from '../lib/errors';
import { toPublicOrder, toPublicProduct } from '../lib/mappers';
import { likePattern } from '../lib/paginate';
import { notifyNewOrder } from '../lib/telegram';
import { createOrder } from '../services/orders';
import { getPublicSettings } from '../services/settings';

const firstPrice = sql<number>`(${products.variants}->0->>'price')::int`;
const firstOldPrice = sql`${products.variants}->0->>'oldPrice'`;

const listQuery = z.object({
  category: z.string().optional(),
  q: z.string().max(100).optional(),
  min: z.coerce.number().int().min(0).optional().catch(undefined),
  max: z.coerce.number().int().min(0).optional().catch(undefined),
  skin: z.string().optional(),
  sale: z.enum(['true', '1']).optional().catch(undefined),
  tag: z.string().optional(),
  sort: z.enum(['pop', 'new', 'asc', 'desc']).catch('pop'),
  limit: z.coerce.number().int().min(1).max(200).optional().catch(undefined),
  ids: z.string().optional(),
});

const ORDER_BY = {
  pop: [desc(products.popularity), asc(products.id)],
  new: [desc(sql`(${products.tag} = 'Yangi')`), desc(products.createdAt), desc(products.id)],
  asc: [asc(firstPrice), asc(products.id)],
  desc: [desc(firstPrice), asc(products.id)],
};

export const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get('/settings', () => getPublicSettings(db));

  app.get('/regions', () => REGIONS);

  app.get('/categories', async (): Promise<PublicCategory[]> => {
    const rows = await db
      .select({
        id: categories.id, name: categories.name, emoji: categories.emoji, bg: categories.bg,
        count: sql<number>`count(${products.id})::int`,
      })
      .from(categories)
      .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.isActive, true)))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt), asc(categories.id));
    return rows;
  });

  app.get('/products', async (req): Promise<PublicProduct[]> => {
    const f = parse(listQuery, req.query);
    const where: (SQL | undefined)[] = [eq(products.isActive, true)];

    if (f.ids !== undefined) {
      const ids = f.ids.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 200);
      if (!ids.length) return [];
      where.push(inArray(products.id, ids));
    }
    if (f.category) where.push(eq(products.categoryId, f.category));
    if (f.q?.trim()) {
      const p = likePattern(f.q);
      where.push(or(ilike(products.name, p), ilike(products.description, p), ilike(categories.name, p)));
    }
    if (f.min) where.push(sql`${firstPrice} >= ${f.min}`);
    if (f.max) where.push(sql`${firstPrice} <= ${f.max}`);
    const skin = f.skin?.split(',').filter((s): s is (typeof SKIN_TYPES)[number] => (SKIN_TYPES as readonly string[]).includes(s));
    if (skin?.length) where.push(sql`${products.skin} && ${sql.raw(`ARRAY[${skin.map((s) => `'${s}'`).join(',')}]::text[]`)}`);
    if (f.sale) where.push(isNotNull(firstOldPrice));
    if (f.tag) where.push(eq(products.tag, f.tag));

    const q = db
      .select({ p: products })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(...where))
      .orderBy(...ORDER_BY[f.sort])
      .$dynamic();
    const rows = await (f.limit ? q.limit(f.limit) : q);
    return rows.map((r) => toPublicProduct(r.p));
  });

  app.get('/products/search', async (req): Promise<PublicProduct[]> => {
    const { q } = parse(z.object({ q: z.string().max(100).default('') }), req.query);
    if (!q.trim()) return [];
    const p = likePattern(q);
    const rows = await db
      .select({ p: products })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .where(and(eq(products.isActive, true), or(ilike(products.name, p), ilike(categories.name, p))))
      .orderBy(desc(products.popularity))
      .limit(6);
    return rows.map((r) => toPublicProduct(r.p));
  });

  app.get<{ Params: { id: string } }>('/products/:id', async (req): Promise<PublicProduct> => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return notFound('Mahsulot');
    const [row] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
    return row ? toPublicProduct(row) : notFound('Mahsulot');
  });

  app.get<{ Params: { id: string } }>('/products/:id/related', async (req): Promise<PublicProduct[]> => {
    const id = Number(req.params.id);
    const [p] = Number.isInteger(id) ? await db.select().from(products).where(eq(products.id, id)) : [];
    if (!p) return [];
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), sql`${products.id} <> ${id}`))
      .orderBy(desc(sql`(${products.categoryId} = ${p.categoryId})`), desc(products.popularity))
      .limit(4);
    return rows.map(toPublicProduct);
  });

  app.get<{ Params: { code: string } }>('/coupons/:code', async (req): Promise<CouponCheck> => {
    const code = req.params.code.trim().toUpperCase();
    const [c] = await db.select().from(coupons).where(eq(coupons.code, code));
    if (!c?.isActive) throw new HttpError(404, 'Promokod topilmadi');
    return { code: c.code, percent: c.percent };
  });

  app.post(
    '/orders',
    { config: { rateLimit: { max: 10, timeWindow: '10 minutes' } } },
    async (req, reply): Promise<PublicOrder> => {
      const input = parse(createOrderSchema, req.body);
      const order = await createOrder(db, input);
      void notifyNewOrder(order, req.log);
      reply.code(201);
      const { adminNote: _ignored, ...pub } = order;
      return pub;
    },
  );

  /** Mijoz buyurtmasini ko'rish: raqam + telefon kerak (begona buyurtmalarni ko'rib bo'lmaydi) */
  app.get<{ Params: { no: string } }>(
    '/orders/:no',
    { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } },
    async (req): Promise<PublicOrder> => {
      const { phone } = parse(z.object({ phone: z.string().default('') }), req.query);
      const [row] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.no, req.params.no.trim().toUpperCase()), eq(orders.phone, formatPhone(phone))));
      return row ? toPublicOrder(row) : notFound('Buyurtma');
    },
  );

  /** Shu qurilmadan berilgan buyurtmalar ro'yxati (raqam + telefon juftliklari bo'yicha) */
  app.post('/orders/lookup', async (req): Promise<PublicOrder[]> => {
    const { refs } = parse(orderLookupSchema, req.body);
    if (!refs.length) return [];
    const rows = await db
      .select()
      .from(orders)
      .where(or(...refs.map((r) => and(eq(orders.no, r.no.toUpperCase()), eq(orders.phone, formatPhone(r.phone))))))
      .orderBy(desc(orders.createdAt));
    return rows.map(toPublicOrder);
  });
};
