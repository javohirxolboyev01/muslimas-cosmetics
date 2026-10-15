import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productPath } from '@mc/shared';
import { useProductSearch, ProductThumb } from '@/features/products';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll';
import { formatPrice } from '@/shared/lib/format';
import { Button } from '@/shared/ui';
import { useSearchStore } from '../model/searchStore';
import './SearchOverlay.css';

export function SearchOverlay() {
  const { open, setOpen } = useSearchStore();
  if (!open) return null;
  return <SearchDialog onClose={() => setOpen(false)} />;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const term = useDebouncedValue(q, 200);
  const { data: results = [], isFetching } = useProductSearch(term);
  const inputRef = useRef<HTMLInputElement>(null);
  useLockBodyScroll(true);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    onClose();
    navigate('/shop' + (v ? `?q=${encodeURIComponent(v)}` : ''));
  };

  const showEmpty = term.trim() && !isFetching && results.length === 0;

  return (
    <div className="sov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sbox" role="dialog" aria-modal="true" aria-label="Qidirish">
        <form onSubmit={onSubmit}>
          <input ref={inputRef} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mahsulot nomini yozing…" autoComplete="off" aria-label="Qidirish" />
          <Button type="submit">Qidirish</Button>
        </form>
        <div className="sres">
          {showEmpty && <p className="sres-empty">Hech narsa topilmadi</p>}
          {term.trim() &&
            results.map((p) => (
              <Link key={p.id} to={productPath(p)} onClick={onClose}>
                <ProductThumb product={p} size="sm" flat />
                <span>{p.name}</span>
                <b>{formatPrice(p.price)}</b>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
