import { memo } from 'react';
import { ORDER_STATUS } from '@/shared/config/constants';
import type { OrderStatus } from '@/shared/types';
import { Badge } from '@/shared/ui';
import styles from './Widgets.module.css';

export const StatusBreakdown = memo(function StatusBreakdown({ counts }: { counts: Partial<Record<OrderStatus, number>> }) {
  const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);
  const statuses = Object.keys(ORDER_STATUS) as OrderStatus[];
  if (!total) return <p className="muted">Bu davrda buyurtma yo'q.</p>;
  return (
    <ul className={styles.list}>
      {statuses.map((s) => {
        const n = counts[s] ?? 0;
        return (
          <li key={s} className={styles.statusRow}>
            <div className={styles.rowHead}>
              <Badge tone={ORDER_STATUS[s].tone} dot>{ORDER_STATUS[s].label}</Badge>
              <strong>{n}</strong>
            </div>
            <div className={styles.track}><span className={styles[`fill_${ORDER_STATUS[s].tone}`]} style={{ width: `${(n / total) * 100}%` }} /></div>
          </li>
        );
      })}
    </ul>
  );
});
