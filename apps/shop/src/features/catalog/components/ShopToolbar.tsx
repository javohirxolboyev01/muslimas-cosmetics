import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SortKey } from '@/features/products/model/types';
import { Icon } from '@/shared/ui';
import './Catalog.css';

const SORTS: [SortKey, string][] = [
  ['pop', 'Mashhurlari'],
  ['new', 'Yangilari'],
  ['asc', 'Arzonidan qimmatiga'],
  ['desc', 'Qimmatidan arzoniga'],
];

interface Props {
  query: string;
  sort: SortKey;
  urlWith: (patch: Record<string, string | null>) => string;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  filtersId: string;
  activeCount: number;
}

export function ShopToolbar({ query, sort, urlWith, filtersOpen, onToggleFilters, filtersId, activeCount }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useState(query);
  useEffect(() => setQ(query), [query]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(urlWith({ q: q.trim() || null }));
  };

  return (
    <div className="tools">
      <button type="button" className="btn btn-soft fbtn" onClick={onToggleFilters} aria-expanded={filtersOpen} aria-controls={filtersId}>
        <Icon name="filter" />
        Filtrlar{activeCount > 0 && <span className="fcount">{activeCount}</span>}
      </button>
      <form onSubmit={onSubmit} role="search">
        <Icon name="search" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Masalan: serum, toner, niqob…" aria-label="Katalogdan qidirish" autoComplete="off" />
      </form>
      <select aria-label="Saralash" value={sort} onChange={(e) => navigate(urlWith({ sort: e.target.value === 'pop' ? null : e.target.value }), { replace: true })}>
        {SORTS.map(([k, l]) => (
          <option key={k} value={k}>{l}</option>
        ))}
      </select>
    </div>
  );
}
