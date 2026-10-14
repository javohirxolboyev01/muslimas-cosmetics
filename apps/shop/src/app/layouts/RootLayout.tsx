import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SearchOverlay } from '@/features/search';
import { Toaster } from '@/shared/toast/Toaster';
import { PageLoader } from '@/shared/ui';
import { BottomNav } from '@/widgets/BottomNav';
import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';
import { TopBar } from '@/widgets/TopBar';
import { ScrollManager } from './ScrollManager';

export function RootLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Sahifa almashganda fokusni asosiy kontentga o'tkazamiz (ekran o'quvchilar uchun)
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <>
      <a href="#main" className="sr">Asosiy kontentga o'tish</a>
      <TopBar />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <SearchOverlay />
      <Toaster />
      <ScrollManager />
    </>
  );
}
