import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Paginated, Product } from '@/shared/types';
import { productsApi, type ProductFilters, type ProductInput } from './api';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
};

/** Mahsulot o'zgarganda unga bog'liq keshlarni yangilash */
const invalidateRelated = (qc: QueryClient) => {
  qc.invalidateQueries({ queryKey: productKeys.lists() });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['categories'] });
};

export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => productsApi.list(filters, signal),
    // Sahifa/filtr almashganda eski ro'yxat ko'rinib turadi — "sakrash" yo'q
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: number) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsApi.get(id, signal),
    enabled: Number.isFinite(id),
  });

/** Qatorga kursor kelganda tahrirlash sahifasi ma'lumotini oldindan yuklash (staleTime'ga rioya qiladi) */
export function usePrefetchProduct() {
  const qc = useQueryClient();
  return useCallback(
    (product: Product) => {
      // Ro'yxatda allaqachon to'liq obyekt bor — tarmoqqa so'rov yubormasdan keshga yozamiz
      if (!qc.getQueryData(productKeys.detail(product.id))) {
        qc.setQueryData(productKeys.detail(product.id), product);
      }
    },
    [qc],
  );
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: (product) => {
      qc.setQueryData(productKeys.detail(product.id), product);
      invalidateRelated(qc);
    },
  });
}

export function useUpdateProduct(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.update(id, input),
    onSuccess: (product) => {
      qc.setQueryData(productKeys.detail(id), product);
      invalidateRelated(qc);
    },
  });
}

/** Faol/nofaol — optimistik yangilanish: UI darhol o'zgaradi, xato bo'lsa orqaga qaytadi */
export function useToggleProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => productsApi.patch(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await qc.cancelQueries({ queryKey: productKeys.lists() });
      const snapshot = qc.getQueriesData<Paginated<Product>>({ queryKey: productKeys.lists() });
      qc.setQueriesData<Paginated<Product>>({ queryKey: productKeys.lists() }, (old) =>
        old && { ...old, items: old.items.map((p) => (p.id === id ? { ...p, isActive } : p)) },
      );
      return { snapshot };
    },
    onError: (_e, _v, ctx) => ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSuccess: (product) => qc.setQueryData(productKeys.detail(product.id), product),
    onSettled: () => invalidateRelated(qc),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: productKeys.detail(id) });
      invalidateRelated(qc);
    },
  });
}
