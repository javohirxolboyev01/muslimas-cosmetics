import { cn } from '@/shared/lib/cn';
import styles from './FilterTabs.module.css';

export interface TabOption<V extends string> {
  value: V;
  label: string;
  count?: number;
}

interface FilterTabsProps<V extends string> {
  options: TabOption<V>[];
  value: V;
  onChange: (value: V) => void;
  label: string;
}

/** Holat bo'yicha filtr chiplari; mobil ekranda gorizontal siljiydi */
export function FilterTabs<V extends string>({ options, value, onChange, label }: FilterTabsProps<V>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={cn(styles.tab, o.value === value && styles.active)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span className={styles.count}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
