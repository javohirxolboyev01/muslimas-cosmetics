import { useQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { catalogKeys } from '../queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: ({ signal }) => catalogService.categories(signal),
    staleTime: 5 * 60 * 1000,
  });
}

/** Toifa nomini olish uchun yordamchi: getName('serum') → 'Serum' */
export function useCategoryName() {
  const { data } = useCategories();
  return (id: string) => data?.find((c) => c.id === id)?.name ?? '';
}

export function useRegions() {
  return useQuery({ queryKey: catalogKeys.regions, queryFn: ({ signal }) => catalogService.regions(signal), staleTime: Infinity });
}
