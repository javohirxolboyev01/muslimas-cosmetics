import { memo } from 'react';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '../Button/Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

/** 1 … 4 5 [6] 7 8 … 20 ko'rinishidagi sahifalar */
const getPages = (page: number, count: number): (number | '…')[] => {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < count - 1) pages.push('…');
  pages.push(count);
  return pages;
};

export const Pagination = memo(function Pagination({ page, pageCount, pageSize, total, onChange, disabled }: PaginationProps) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className={styles.wrap} aria-label="Sahifalash">
      <span className={styles.info}>
        {formatNumber(from)}–{formatNumber(to)} / {formatNumber(total)}
      </span>
      {pageCount > 1 && (
        <div className={styles.pages}>
          <Button variant="ghost" size="sm" icon="chevronLeft" iconOnly disabled={disabled || page <= 1} onClick={() => onChange(page - 1)}>
            Oldingi sahifa
          </Button>
          {getPages(page, pageCount).map((p, i) =>
            p === '…' ? (
              <span key={`gap${i}`} className={styles.gap}>…</span>
            ) : (
              <button
                key={p}
                type="button"
                className={styles.page}
                aria-current={p === page ? 'page' : undefined}
                disabled={disabled}
                onClick={() => p !== page && onChange(p)}
              >
                {p}
              </button>
            ),
          )}
          <Button variant="ghost" size="sm" icon="chevronRight" iconOnly disabled={disabled || page >= pageCount} onClick={() => onChange(page + 1)}>
            Keyingi sahifa
          </Button>
        </div>
      )}
    </nav>
  );
});
