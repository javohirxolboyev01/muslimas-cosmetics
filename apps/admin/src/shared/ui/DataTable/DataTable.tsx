import { memo, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '../States/States';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /**
   * Mobil karta ko'rinishida:
   *  - "primary": karta sarlavhasi (label'siz, to'liq kenglikda)
   *  - "hidden": ko'rsatilmaydi
   *  - "actions": karta pastida, label'siz
   */
  mobile?: 'primary' | 'hidden' | 'actions';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  /** Fon rejimida yangilanayotganda — eski ma'lumot xira ko'rinadi */
  fetching?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Kursor qatorga kelganda (masalan, prefetch uchun) */
  onRowHover?: (row: T) => void;
  skeletonRows?: number;
  caption?: string;
}

/**
 * Desktop'da klassik jadval, ≤ 768px'da har bir qator kartaga aylanadi.
 * Bitta markup — ikkita ko'rinish (CSS orqali), shuning uchun DOM ikki marta render qilinmaydi.
 */
function DataTableInner<T>({
  columns, rows, rowKey, loading, fetching, empty, onRowClick, onRowHover, skeletonRows = 6, caption,
}: DataTableProps<T>) {
  const showSkeleton = loading && !rows;
  const isEmpty = !showSkeleton && rows?.length === 0;

  const handleKey = (e: KeyboardEvent, row: T) => {
    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onRowClick(row);
    }
  };

  return (
    <div className={cn(styles.wrap, fetching && !showSkeleton && styles.fetching)} aria-busy={loading || fetching}>
      <table className={styles.table}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align }} scope="col">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showSkeleton &&
            Array.from({ length: skeletonRows }, (_, i) => (
              <tr key={`sk${i}`} className={styles.skeletonRow}>
                {columns.map((c) => (
                  <td key={c.key} data-mobile={c.mobile}><Skeleton width={c.mobile === 'primary' ? '70%' : '60%'} /></td>
                ))}
              </tr>
            ))}
          {rows?.map((row) => (
            <tr
              key={rowKey(row)}
              className={cn(onRowClick && styles.clickable)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onMouseEnter={onRowHover ? () => onRowHover(row) : undefined}
              onKeyDown={onRowClick ? (e) => handleKey(e, row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} data-label={c.header} data-mobile={c.mobile} style={{ textAlign: c.align }}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {isEmpty && empty}
    </div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
