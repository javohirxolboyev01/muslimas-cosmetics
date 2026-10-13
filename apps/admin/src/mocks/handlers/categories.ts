import { ApiError } from '@/shared/api/ApiError';
import type { Category } from '@/shared/types';
import { db } from '../db';
import type { MockRequest, MockRoute } from '../router';
import { notFound } from '../utils';

const findIndex = (id: string) => {
  const i = db.data.categories.findIndex((c) => c.id === id);
  return i === -1 ? notFound('Toifa') : i;
};

export const categoryRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/categories',
    handler: () =>
      db.data.categories.map((c) => ({
        ...c,
        productCount: db.data.products.filter((p) => p.categoryId === c.id).length,
      })),
  },
  {
    method: 'POST',
    path: '/categories',
    handler: ({ body }: MockRequest<Category>) => {
      if (db.data.categories.some((c) => c.id === body.id)) {
        throw new ApiError(409, 'Bunday ID bilan toifa allaqachon bor', { id: 'Boshqa ID tanlang' });
      }
      db.write((d) => { d.categories.push(body); });
      return body;
    },
  },
  {
    method: 'PUT',
    path: '/categories/:id',
    handler: ({ params, body }: MockRequest<Omit<Category, 'id'>>) => {
      const i = findIndex(params.id);
      db.write((d) => { d.categories[i] = { ...d.categories[i], ...body, id: params.id }; });
      return db.data.categories[i];
    },
  },
  {
    method: 'DELETE',
    path: '/categories/:id',
    handler: ({ params }) => {
      const i = findIndex(params.id);
      const used = db.data.products.filter((p) => p.categoryId === params.id).length;
      if (used) throw new ApiError(409, `Bu toifada ${used} ta mahsulot bor. Avval ularni boshqa toifaga o'tkazing.`);
      db.write((d) => { d.categories.splice(i, 1); });
    },
  },
];
