import { Link } from 'react-router-dom';
import { BOTTOM_NAV } from '@/config/navigation';
import { useCartCount } from '@/features/cart';
import { useWishCount } from '@/features/wishlist';
import { useActiveNavKey } from '@/shared/hooks/useActiveNavKey';
import { Badge, Icon } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import './BottomNav.css';

/** Faqat mobil/planshet ekranlarda ko'rinadigan pastki menyu. */
export function BottomNav() {
  const active = useActiveNavKey();
  const counts = { cart: useCartCount(), wish: useWishCount() };
  return (
    <nav className="bnav" aria-label="Pastki menyu">
      {BOTTOM_NAV.map((n) => (
        <Link key={n.key} to={n.to} className={cn(active === n.key && 'on')} aria-current={active === n.key ? 'page' : undefined}>
          <Icon name={n.icon} />
          {n.label}
          {n.badge && <Badge count={counts[n.badge]} />}
        </Link>
      ))}
    </nav>
  );
}
