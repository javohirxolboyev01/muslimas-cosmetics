import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MAIN_NAV } from '@/config/navigation';
import { useCartCount } from '@/features/cart';
import { useWishCount } from '@/features/wishlist';
import { useSearchStore } from '@/features/search';
import { useActiveNavKey } from '@/shared/hooks/useActiveNavKey';
import { Badge, Icon, Logo } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import './Header.css';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveNavKey();
  const location = useLocation();
  const cartCount = useCartCount();
  const wishCount = useWishCount();
  const openSearch = useSearchStore((s) => s.setOpen);

  useEffect(() => setMenuOpen(false), [location]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header className="site">
      <div className="wrap nav">
        <Logo />
        <nav className={cn('menu', menuOpen && 'on')} id="main-menu" aria-label="Asosiy menyu">
          {MAIN_NAV.map((n) => (
            <Link key={n.key} to={n.to} className={cn(active === n.key && 'on')} aria-current={active === n.key ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="actions">
          <button type="button" className="icon-btn" onClick={() => openSearch(true)} aria-label="Qidirish">
            <Icon name="search" />
          </button>
          <Link className="icon-btn hide-mobile" to="/wishlist" aria-label={`Sevimlilar (${wishCount})`}>
            <Icon name="heart" />
            <Badge count={wishCount} />
          </Link>
          <Link className="icon-btn" to="/cart" aria-label={`Savat (${cartCount})`}>
            <Icon name="bag" />
            <Badge count={cartCount} />
          </Link>
          <button type="button" className="icon-btn burger" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'} aria-expanded={menuOpen} aria-controls="main-menu">
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}
