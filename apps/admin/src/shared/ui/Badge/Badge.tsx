import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'pink' | 'info' | 'warn' | 'accent' | 'ok' | 'bad';

export const Badge = ({ tone = 'neutral', children, dot }: { tone?: BadgeTone; children: ReactNode; dot?: boolean }) => (
  <span className={cn(styles.badge, styles[tone])}>
    {dot && <span className={styles.dot} aria-hidden="true" />}
    {children}
  </span>
);
