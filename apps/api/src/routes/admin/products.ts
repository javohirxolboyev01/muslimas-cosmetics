import { and, asc, count, desc, eq, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { LOW_STOCK_LIMIT, productInputSchema, productPatchSchema, type Paginated, type Product } from '@mc/shared';
import { db } from '../../db/client';
import { categories, products } from '../../db/schema';
import { HttpError, notFound, parse } from '../../lib/errors';
import { toProduct } from '../../lib/mappers';
import { likePattern, pageQuery, pageWindow, paginated } from '../../lib/paginate';

const firstPrice = sql`(${products.variants}->0->>'price')::int`;

const SORT = {
  newest: [desc(products.createdAt), desc(products.id)],
  popular: [desc(products.popularity), desc(products.id)],
  price_asc: [asc(firstPrice), asc(products.id)],
  price_desc: [desc(firstPrice), asc(products.id)],
  stock_asc: [asc(products.stock), asc(products.id)],
};

const listQuery = pageQuery.extend({
  search: z.string().default(''),
  categoryId: z.string().default(''),
  status: z.enum(['', 'active', 'inactive', 'low']).catch(''),
  sort: z.enum(['newest', 'popular', 'price_asc', 'price_desc', 'stock_asc']).catch('newest'),
});

const idParam = (raw: string) => {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : notFound('Mahsulot');
};

async function assertCategory(categoryId: string) {
  const [c] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId));
  if (!c) throw new HttpError(422, 'Toifa mavjud emas', { categoryId: 'Toifani tanlang' });
}

export const productAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (req): Promise<Paginated<Product>> => {
    const f = parse(listQuery, req.query);
    const where: (SQL | undefined)[] = [];
    if (f.search.trim()) {
      const p = likePattern(f.search);
      where.push(or(ilike(products.name, p), ilike(products.ingredients, p)));
    }
    if (f.categoryId) where.push(eq(products.categoryId, f.categoryId));
    if (f.status === 'active') where.push(eq(products.isActive, true));
    if (f.status === 'inactive') where.push(eq(products.isActive, false));
    if (f.status === 'low') where.push(lte(products.stock, LOW_STOCK_LIMIT));

    const cond = and(...where);
    const [{ total }] = await db.select({ total: count() }).from(products).where(cond);
    const w = pageWindow(total, f.page, f.pageSize);
    const rows = await db.select().from(products).where(cond).orderBy(...SORT[f.sort]).limit(w.limit).offset(w.offset);
    return paginated(rows.map(toProduct), total, w, f.pageSize);
  });

  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const [row] = await db.select().from(products).where(eq(products.id, idParam(req.params.id)));
    return row ? toProduct(row) : notFound('Mahsulot');
  });

  app.post('/', async (req, reply) => {
    const input = parse(productInputSchema, req.body);
    await assertCategory(input.categoryId);
    const [row] = await db.insert(products).values(input).returning();
    reply.code(201);
    return toProduct(row);
  });

  const update = (partial: boolean) => async (req: { params: { id: string }; body: unknown }) => {
    const id = idParam(req.params.id);
    const input = partial ? parse(productPatchSchema, req.body) : parse(productInputSchema, req.body);
    if (input.categoryId) await assertCategory(input.categoryId);
    const [row] = await db.update(products).set(input).where(eq(products.id, id)).returning();
    return row ? toProduct(row) : notFound('Mahsulot');
  };
  app.put<{ Params: { id: string } }>('/:id', update(false));
  app.patch<{ Params: { id: string } }>('/:id', update(true));

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const [row] = await db.delete(products).where(eq(products.id, idParam(req.params.id))).returning({ id: products.id });
    if (!row) return notFound('Mahsulot');
    reply.code(204);
  });
};
