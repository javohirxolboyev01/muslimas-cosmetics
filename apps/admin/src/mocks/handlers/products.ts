import { ApiError } from '@/shared/api/ApiError';
import { LOW_STOCK_LIMIT } from '@/shared/config/constants';
import type { Product } from '@/shared/types';
import { db } from '../db';
import type { MockRequest, MockRoute } from '../router';
import { includesText, notFound, paginate } from '../utils';

type ProductInput = Omit<Product, 'id' | 'createdAt' | 'popularity'>;

const SORTERS: Record<string, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.popularity - a.popularity,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  price_asc: (a, b) => a.variants[0].price - b.variants[0].price,
  price_desc: (a, b) => b.variants[0].price - a.variants[0].price,
  stock_asc: (a, b) => a.stock - b.stock,
};

const STATUS_FILTERS: Record<string, (p: Product) => boolean> = {
  active: (p) => p.isActive,
  inactive: (p) => !p.isActive,
  low: (p) => p.stock <= LOW_STOCK_LIMIT,
};

const findIndex = (id: string) => {
  const i = db.data.products.findIndex((p) => p.id === Number(id));
  return i === -1 ? notFound('Mahsulot') : i;
};

const assertCategory = (categoryId: string) => {
  if (!db.data.categories.some((c) => c.id === categoryId)) {
    throw new ApiError(422, 'Toifa mavjud emas', { categoryId: 'Toifani tanlang' });
  }
};

export const productRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/products',
    handler: ({ query }) => {
      const statusFilter = STATUS_FILTERS[String(query.status)];
      const list = db.data.products
        .filter((p) => includesText(`${p.name} ${p.ingredients}`, query.search))
        .filter((p) => !query.categoryId || p.categoryId === query.categoryId)
        .filter((p) => !statusFilter || statusFilter(p))
        .sort(SORTERS[String(query.sort)] ?? SORTERS.newest);
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    path: '/products/:id',
    handler: ({ params }) => db.data.products[findIndex(params.id)],
  },
  {
    method: 'POST',
    path: '/products',
    handler: ({ body }: MockRequest<ProductInput>) => {
      assertCategory(body.categoryId);
      const product: Product = {
        ...body,
        id: Math.max(0, ...db.data.products.map((p) => p.id)) + 1,
        popularity: 50,
        createdAt: new Date().toISOString(),
      };
      db.write((d) => { d.products.unshift(product); });
      return product;
    },
  },
  {
    method: 'PUT',
    path: '/products/:id',
    handler: ({ params, body }: MockRequest<ProductInput>) => {
      assertCategory(body.categoryId);
      const i = findIndex(params.id);
      db.write((d) => { d.products[i] = { ...d.products[i], ...body }; });
      return db.data.products[i];
    },
  },
  {
    method: 'PATCH',
    path: '/products/:id',
    handler: ({ params, body }: MockRequest<Partial<ProductInput>>) => {
      const i = findIndex(params.id);
      db.write((d) => { d.products[i] = { ...d.products[i], ...body }; });
      return db.data.products[i];
    },
  },
  {
    method: 'DELETE',
    path: '/products/:id',
    handler: ({ params }) => {
      const i = findIndex(params.id);
      db.write((d) => { d.products.splice(i, 1); });
    },
  },
];
