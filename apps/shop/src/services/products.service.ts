import { http } from '@/shared/api/http';
import type { Product, ProductFilters } from '@/features/products/model/types';

const toQuery = (f: ProductFilters) => ({
  category: f.category,
  q: f.q?.trim(),
  min: f.min,
  max: f.max,
  skin: f.skin?.join(','),
  sale: f.sale,
  sort: f.sort,
  tag: f.tag,
  limit: f.limit,
});

export const productsService = {
  list: (filters: ProductFilters = {}, signal?: AbortSignal) => http.get<Product[]>('/public/products', toQuery(filters), signal),

  getById: (id: number, signal?: AbortSignal) => http.get<Product>(`/public/products/${id}`, undefined, signal),

  getByIds: (ids: number[], signal?: AbortSignal) =>
    ids.length
      ? http.get<Product[]>('/public/products', { ids: ids.join(',') }, signal).then((list) => {
          // So'ralgan tartibni saqlaymiz (masalan, oxirgi ko'rilganlar)
          const byId = new Map(list.map((p) => [p.id, p]));
          return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
        })
      : Promise.resolve([]),

  related: (id: number, signal?: AbortSignal) => http.get<Product[]>(`/public/products/${id}/related`, undefined, signal),

  search: (q: string, signal?: AbortSignal) => http.get<Product[]>('/public/products/search', { q }, signal),
};
