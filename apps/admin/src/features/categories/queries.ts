import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { productKeys } from '@/features/products/queries';
import { categoriesApi } from './api';

export const categoryKeys = { all: ['categories'] as const };

/** Toifalar kam o'zgaradi — 5 daqiqa davomida qayta so'ralmaydi */
export const useCategories = () =>
  useQuery({
    queryKey: categoryKeys.all,
    queryFn: ({ signal }) => categoriesApi.list(signal),
    staleTime: 5 * 60_000,
  });

/** id -> nom xaritasi (jadvallarda tez topish uchun) */
export const useCategoryNames = () => {
  const { data } = useCategories();
  return useMemo(() => Object.fromEntries((data ?? []).map((c) => [c.id, c.name])) as Record<string, string>, [data]);
};

export function useSaveCategory(mode: 'create' | 'update') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: mode === 'create' ? categoriesApi.create : categoriesApi.update,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.all });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
