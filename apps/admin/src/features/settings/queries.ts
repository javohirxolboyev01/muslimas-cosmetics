import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { meQueryKey } from '@/features/auth/AuthProvider';
import { settingsApi } from './api';

export const settingsKeys = { all: ['settings'] as const };

export const useSettings = () =>
  useQuery({ queryKey: settingsKeys.all, queryFn: ({ signal }) => settingsApi.get(signal), staleTime: 5 * 60_000 });

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.update,
    onSuccess: (data) => qc.setQueryData(settingsKeys.all, data),
  });
}

/** Mock DB'ni boshlang'ich holatga qaytarish — barcha kesh tozalanadi (sessiya saqlanadi) */
export function useResetDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.resetDemo,
    onSuccess: () => qc.removeQueries({ predicate: (q) => q.queryKey[0] !== meQueryKey[0] }),
  });
}
