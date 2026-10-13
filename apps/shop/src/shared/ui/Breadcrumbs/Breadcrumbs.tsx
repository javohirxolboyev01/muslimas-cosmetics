import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Sahifa yo'li">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        const node = c.to && !last ? <Link to={c.to}>{c.label}</Link> : <span aria-current={last ? 'page' : undefined}>{c.label}</span>;
        return <Fragment key={i}>{i === 0 ? node : <span className="sep">{node}</span>}</Fragment>;
      })}
    </nav>
  );
}
