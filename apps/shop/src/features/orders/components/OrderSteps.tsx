import { cn } from '@/shared/lib/cn';
import { ORDER_STATUS_LABELS, ORDER_STEPS } from '../lib/labels';
import type { OrderStatus } from '../model/types';
import './Orders.css';

export function OrderSteps({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return <p className="steps-cancelled" role="status">Buyurtma bekor qilingan</p>;
  }
  const current = ORDER_STEPS.indexOf(status);
  return (
    <ol className="steps" aria-label="Buyurtma holati">
      {ORDER_STEPS.map((s, i) => (
        <li key={s} className={cn(i <= current && 'done')} aria-current={i === current ? 'step' : undefined}>
          {ORDER_STATUS_LABELS[s]}
        </li>
      ))}
    </ol>
  );
}
