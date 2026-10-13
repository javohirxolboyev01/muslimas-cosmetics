import type { ProductFilters } from './model/types';

/** Barcha mahsulot so'rovlari uchun yagona kalitlar fabrikasi. */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters = {}) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  related: (id: number) => [...productKeys.all, 'related', id] as const,
  byIds: (ids: number[]) => [...productKeys.all, 'byIds', ids] as const,
  search: (q: string) => [...productKeys.all, 'search', q] as const,
};

export const catalogKeys = {
  categories: ['catalog', 'categories'] as const,
  total: ['catalog', 'total'] as const,
  regions: ['catalog', 'regions'] as const,
};
