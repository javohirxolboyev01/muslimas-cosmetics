import type { ReactNode } from 'react';
import { getErrorMessage } from '@/shared/api/ApiError';
import { cn } from '@/shared/lib/cn';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';
import styles from './States.module.css';

export const EmptyState = ({ emoji = '🌸', title, description, action }: {
  emoji?: string; title: string; description?: ReactNode; action?: ReactNode;
}) => (
  <div className={styles.box}>
    <div className={styles.emoji} aria-hidden="true">{emoji}</div>
    <p className={styles.title}>{title}</p>
    {description && <p className={styles.desc}>{description}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export const ErrorState = ({ error, onRetry, retrying }: { error: unknown; onRetry?: () => void; retrying?: boolean }) => (
  <div className={styles.box} role="alert">
    <div className={cn(styles.emoji, styles.errorIcon)}><Icon name="alert" size={30} /></div>
    <p className={styles.title}>Ma'lumotni yuklab bo'lmadi</p>
    <p className={styles.desc}>{getErrorMessage(error)}</p>
    {onRetry && (
      <div className={styles.action}>
        <Button variant="secondary" icon="refresh" onClick={onRetry} loading={retrying}>Qayta urinish</Button>
      </div>
    )}
  </div>
);

export const Skeleton = ({ width = '100%', height = 14, radius = 8, className }: {
  width?: number | string; height?: number | string; radius?: number; className?: string;
}) => <span className={cn(styles.skeleton, className)} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
