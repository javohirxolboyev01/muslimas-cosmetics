import { memo } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import type { Order } from '@/shared/types';
import styles from './Widgets.module.css';

export const RecentOrders = memo(function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <ul className={styles.list}>
      {orders.map((o) => (
        <li key={o.no}>
          <Link to={`/orders/${o.no}`} className={styles.orderRow}>
            <div className={styles.orderMain}>
              <strong>{o.no}</strong>
              <small className="muted">{o.name} · {formatDateTime(o.date)}</small>
            </div>
            <OrderStatusBadge status={o.status} />
            <span className="money">{formatMoney(o.total)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
});
