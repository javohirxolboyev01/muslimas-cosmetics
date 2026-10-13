import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { env } from '@/shared/config/env';
import { ToastProvider } from '@/shared/ui';
import { queryClient } from './queryClient';

// Devtools faqat development rejimida va alohida chunk sifatida yuklanadi
const Devtools = env.isDev
  ? lazy(() => import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })))
  : () => null;

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
    <Suspense fallback={null}>
      <Devtools buttonPosition="bottom-left" />
    </Suspense>
  </QueryClientProvider>
);
