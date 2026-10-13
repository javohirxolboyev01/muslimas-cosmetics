import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Spinner } from '@/shared/ui';
import { AppProviders } from './providers/AppProviders';
import { router } from './router';

const FullScreenLoader = () => (
  <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'var(--pink)' }}>
    <Spinner size={32} label="Yuklanmoqda" />
  </div>
);

export const App = () => (
  <AppProviders>
    <Suspense fallback={<FullScreenLoader />}>
      <RouterProvider router={router} />
    </Suspense>
  </AppProviders>
);
