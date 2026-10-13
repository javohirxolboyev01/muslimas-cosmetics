import { asc, count, eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { categorySchema, categoryUpdateSchema } from '@mc/shared';
import { db } from '../../db/client';
import { categories, products } from '../../db/schema';
import { HttpError, notFound, parse } from '../../lib/errors';

const pick = ({ id, name, emoji, bg }: typeof categories.$inferSelect) => ({ id, name, emoji, bg });

export const categoryAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    const rows = await db
      .select({ c: categories, productCount: count(products.id) })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt), asc(categories.id));
    return rows.map((r) => ({ ...pick(r.c), productCount: r.productCount }));
  });

  app.post('/', async (req, reply) => {
    const input = parse(categorySchema, req.body);
    const [row] = await db.insert(categories).values(input).onConflictDoNothing().returning();
    if (!row) throw new HttpError(409, 'Bunday ID bilan toifa allaqachon bor', { id: 'Boshqa ID tanlang' });
    reply.code(201);
    return pick(row);
  });

  app.put<{ Params: { id: string } }>('/:id', async (req) => {
    const input = parse(categoryUpdateSchema, req.body);
    const [row] = await db.update(categories).set(input).where(eq(categories.id, req.params.id)).returning();
    return row ? pick(row) : notFound('Toifa');
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req, reply) => {
    const [{ used }] = await db.select({ used: count() }).from(products).where(eq(products.categoryId, req.params.id));
    if (used) throw new HttpError(409, `Bu toifada ${used} ta mahsulot bor. Avval ularni boshqa toifaga o'tkazing.`);
    const [row] = await db.delete(categories).where(eq(categories.id, req.params.id)).returning({ id: categories.id });
    if (!row) return notFound('Toifa');
    reply.code(204);
  });
};
