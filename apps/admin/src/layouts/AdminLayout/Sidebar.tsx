import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrderStatusCounts } from '@/features/orders/queries';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui';
import { NAV_ITEMS } from './navigation';
import styles from './AdminLayout.module.css';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export const Sidebar = memo(function Sidebar({ open, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const { data: counts } = useOrderStatusCounts();
  const newOrders = counts?.new ?? 0;

  return (
    <aside id="sidebar" className={cn(styles.sidebar, open && styles.sidebarOpen)} aria-label="Asosiy menyu">
      <div className={styles.brand}>
        <span className={styles.logo}>Muslima's Cosmetics</span>
        <span className={styles.brandSub}>Admin panel</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) => cn(styles.navLink, isActive && styles.navActive)}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.label}</span>
            {item.badge === 'newOrders' && newOrders > 0 && (
              <span className={styles.navBadge} aria-label={`${newOrders} ta yangi`}>{newOrders}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.user}>
        <span className={styles.avatar} aria-hidden="true">{user?.name?.[0] ?? 'A'}</span>
        <div className={styles.userText}>
          <strong>{user?.name ?? '…'}</strong>
          <small>{user?.email}</small>
        </div>
        <button type="button" className={styles.logout} onClick={logout} title="Chiqish">
          <Icon name="logout" size={18} />
          <span className="sr-only">Chiqish</span>
        </button>
      </div>
    </aside>
  );
});
