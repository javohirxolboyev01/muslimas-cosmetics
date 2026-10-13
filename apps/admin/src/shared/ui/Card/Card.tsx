import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  actions?: ReactNode;
  /** Ichki padding'siz (jadval uchun) */
  flush?: boolean;
}

export const Card = ({ title, actions, flush, className, children, ...rest }: CardProps) => (
  <section className={cn(styles.card, flush && styles.flush, className)} {...rest}>
    {(title || actions) && (
      <header className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
    )}
    {children}
  </section>
);
