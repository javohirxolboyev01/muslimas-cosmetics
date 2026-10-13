import { memo } from 'react';
import { Link } from 'react-router-dom';
import { stockInfo } from '@/features/products/lib';
import type { Product } from '@/shared/types';
import { Badge, ProductThumb } from '@/shared/ui';
import styles from './Widgets.module.css';

export const LowStock = memo(function LowStock({ items }: { items: Product[] }) {
  if (!items.length) return <p className="muted">Hammasi yetarli 👌</p>;
  return (
    <ul className={styles.list}>
      {items.map((p) => {
        const s = stockInfo(p.stock);
        return (
          <li key={p.id}>
            <Link to={`/products/${p.id}/edit`} className={styles.stockRow}>
              <ProductThumb product={p} size={36} />
              <span className={styles.stockName}>{p.name}</span>
              <Badge tone={s.tone}>{s.label}</Badge>
            </Link>
          </li>
        );
      })}
    </ul>
  );
});
