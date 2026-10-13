import { ORDER_FLOW, ORDER_STATUS } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import type { OrderStatus } from '@/shared/types';
import { Icon } from '@/shared/ui';
import styles from './OrderTimeline.module.css';

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return <p className={styles.cancelled}><Icon name="alert" size={18} /> Buyurtma bekor qilingan</p>;
  }
  const current = ORDER_FLOW.indexOf(status);
  return (
    <ol className={styles.steps} aria-label="Buyurtma holati">
      {ORDER_FLOW.map((s, i) => (
        <li key={s} className={cn(styles.step, i <= current && styles.done)} aria-current={i === current ? 'step' : undefined}>
          <span className={styles.dot}>{i < current ? <Icon name="check" size={14} /> : i + 1}</span>
          <span className={styles.label}>{ORDER_STATUS[s].label}</span>
        </li>
      ))}
    </ol>
  );
}
