import type { ReactNode } from 'react';
import { Breadcrumbs, type Crumb } from '../Breadcrumbs/Breadcrumbs';
import './PageHeader.css';

interface Props {
  crumbs: Crumb[];
  title?: ReactNode;
  subtitle?: ReactNode;
  compact?: boolean;
}

export function PageHeader({ crumbs, title, subtitle, compact }: Props) {
  return (
    <div className="ph" style={compact ? { paddingBottom: 0 } : undefined}>
      <Breadcrumbs items={[{ label: 'Bosh sahifa', to: '/' }, ...crumbs]} />
      {title && <h1>{title}</h1>}
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
