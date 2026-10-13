import { Link } from 'react-router-dom';
import { formatDate, formatPrice } from '@/shared/lib/format';
import { ORDER_STATUS_LABELS } from '../lib/labels';
import type { Order } from '../model/types';
import './Orders.css';

export function OrderListItem({ order: o }: { order: Order }) {
  const qty = o.items.reduce((s, x) => s + x.qty, 0);
  return (
    <Link className="oitem" to={`/order/${o.no}`}>
      <div>
        <b>{o.no}</b>
        <br />
        <small className="muted">
          {formatDate(o.date)} · {qty} ta mahsulot
        </small>
      </div>
      <span className={o.status === 'cancelled' ? 'pill pill-muted' : 'pill'}>{ORDER_STATUS_LABELS[o.status]}</span>
      <b className="oitem-total">{formatPrice(o.total)}</b>
    </Link>
  );
}
