import { memo } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '@/shared/lib/format';
import type { DashboardData } from '../api';
import styles from './Widgets.module.css';

export const TopProducts = memo(function TopProducts({ items }: { items: DashboardData['topProducts'] }) {
  if (!items.length) return <p className="muted">Ma'lumot yo'q.</p>;
  const max = items[0].revenue;
  return (
    <ol className={styles.list}>
      {items.map((p, i) => (
        <li key={p.productId} className={styles.top}>
          <span className={styles.rank}>{i + 1}</span>
          <div className={styles.topBody}>
            <div className={styles.rowHead}>
              <Link to={`/products/${p.productId}/edit`} className={styles.topName}>{p.name}</Link>
              <span className="money">{formatMoney(p.revenue)}</span>
            </div>
            <div className={styles.track}><span className={styles.fill_pink} style={{ width: `${(p.revenue / max) * 100}%` }} /></div>
            <small className="muted">{p.qty} dona sotildi</small>
          </div>
        </li>
      ))}
    </ol>
  );
});
