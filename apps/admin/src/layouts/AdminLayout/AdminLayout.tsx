import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { cn } from '@/shared/lib/cn';
import { Button, Spinner } from '@/shared/ui';
import { Sidebar } from './Sidebar';
import styles from './AdminLayout.module.css';

export function AdminLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Sahifa almashganda tepaga qaytish
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Desktop'ga o'tilsa drawer yopiladi; mobil'da drawer ochiq bo'lsa fon scroll bo'lmaydi
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>Asosiy kontentga o'tish</a>
      <Sidebar open={menuOpen} onNavigate={closeMenu} />
      <div className={cn(styles.backdrop, menuOpen && styles.backdropOn)} onClick={closeMenu} aria-hidden="true" />

      <div className={styles.content}>
        <header className={styles.topbar}>
          <Button
            variant="ghost"
            icon="menu"
            iconOnly
            className={styles.burger}
            aria-expanded={menuOpen}
            aria-controls="sidebar"
            onClick={() => setMenuOpen((v) => !v)}
          >
            Menyu
          </Button>
          <span className={styles.topLogo}>Muslima's Cosmetics</span>
        </header>

        <main id="main" className={styles.main} tabIndex={-1}>
          {/* Lazy sahifalar yuklanguncha layout joyida qoladi */}
          <Suspense fallback={<div className={styles.pageLoader}><Spinner size={28} label="Yuklanmoqda" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
