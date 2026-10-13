import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './SectionHeader.css';

interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: { label: string; to: string };
}

export function SectionHeader({ title, subtitle, action }: Props) {
  return (
    <div className="sec-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <Link className="more" to={action.to}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
