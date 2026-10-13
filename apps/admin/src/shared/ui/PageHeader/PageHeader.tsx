import type { ReactNode } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ButtonLink } from '../Button/Button';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  backTo?: string;
}

export function PageHeader({ title, description, actions, backTo }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className={styles.header}>
      <div className={styles.main}>
        {backTo && (
          <ButtonLink to={backTo} variant="secondary" size="sm" icon="arrowLeft" iconOnly>
            Orqaga
          </ButtonLink>
        )}
        <div>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.desc}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
