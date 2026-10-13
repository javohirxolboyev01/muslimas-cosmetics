import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { productKeys } from '../queryKeys';
import type { Product, ProductFilters } from '../model/types';

export function useProducts(filters: ProductFilters = {}, opts: { keepPrevious?: boolean } = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => productsService.list(filters, signal),
    placeholderData: opts.keepPrevious ? keepPreviousData : undefined,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsService.getById(id, signal),
    retry: false,
    enabled: Number.isFinite(id),
  });
}

export function useRelatedProducts(id: number) {
  return useQuery({
    queryKey: productKeys.related(id),
    queryFn: ({ signal }) => productsService.related(id, signal),
    enabled: Number.isFinite(id),
  });
}

export function useProductsByIds(ids: number[]) {
  return useQuery({
    queryKey: productKeys.byIds(ids),
    queryFn: ({ signal }) => productsService.getByIds(ids, signal),
    enabled: ids.length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useProductSearch(q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: productKeys.search(term.toLowerCase()),
    queryFn: ({ signal }) => productsService.search(term, signal),
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
  });
}

/** Barcha mahsulotlar id → Product ko'rinishida (savat va buyurtma hisobi uchun). */
export function useProductMap() {
  return useQuery({
    queryKey: productKeys.list({}),
    queryFn: ({ signal }) => productsService.list({}, signal),
    select: (list: Product[]) => new Map(list.map((p) => [p.id, p])),
  });
}
