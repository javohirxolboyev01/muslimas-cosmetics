import { memo, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Icon, type IconName } from '../Icon/Icon';
import { Skeleton } from '../States/States';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: IconName;
  tint?: 'pink' | 'lilac' | 'mint' | 'butter';
  /** Oldingi davrga nisbatan o'zgarish, % */
  delta?: number | null;
  loading?: boolean;
}

export const StatCard = memo(function StatCard({ label, value, icon, tint = 'pink', delta, loading }: StatCardProps) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const up = hasDelta && delta >= 0;
  return (
    <div className={styles.card}>
      <span className={cn(styles.icon, styles[tint])}><Icon name={icon} size={22} /></span>
      <div className={styles.body}>
        <span className={styles.label}>{label}</span>
        {loading ? <Skeleton width="70%" height={26} /> : <strong className={styles.value}>{value}</strong>}
        {!loading && hasDelta && (
          <span className={cn(styles.delta, up ? styles.up : styles.down)}>
            <Icon name={up ? 'trendUp' : 'trendDown'} size={14} />
            {up ? '+' : ''}{delta.toFixed(0)}% <span className={styles.vs}>oldingi davrga</span>
          </span>
        )}
      </div>
    </div>
  );
});
