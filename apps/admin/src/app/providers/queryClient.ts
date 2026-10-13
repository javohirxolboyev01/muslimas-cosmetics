import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/shared/api/ApiError';
import { authToken } from '@/shared/lib/authToken';

const onUnauthorized = (error: unknown) => {
  if (isApiError(error) && error.status === 401 && authToken.get()) {
    authToken.clear();
    window.location.assign('/login');
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onUnauthorized }),
  mutationCache: new MutationCache({ onError: onUnauthorized }),
  defaultOptions: {
    queries: {
      // 30 soniya ichida bir xil ma'lumot qayta so'ralmaydi (sahifalar orasida o'tganda ham)
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      // Oyna fokusiga qaytganda har safar so'rov yubormaslik
      refetchOnWindowFocus: false,
      // 4xx xatolarda qayta urinish ma'nosiz; tarmoq/5xx — 2 marta
      retry: (count, error) => !(isApiError(error) && error.status < 500) && count < 2,
    },
    mutations: { retry: false },
  },
});
