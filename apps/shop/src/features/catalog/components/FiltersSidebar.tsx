import { Link } from 'react-router-dom';
import { useCategories } from '@/features/products';
import { SKIN_LABELS } from '@mc/shared';
import type { ProductFilters, SkinType } from '@/features/products/model/types';
import { Button, Chip, ChipGroup, Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import './Catalog.css';

const PRICE_RANGES: [string, number, number][] = [
  ['Barchasi', 0, 0],
  ['120 000 gacha', 0, 120000],
  ['120 000 – 200 000', 120000, 200000],
  ['200 000 dan yuqori', 200000, 0],
];

interface Props {
  filters: ProductFilters;
  urlWith: (patch: Record<string, string | number | boolean | null | undefined>) => string;
  hasActive: boolean;
  open: boolean;
  id: string;
}

export function FiltersSidebar({ filters, urlWith, hasActive, open, id }: Props) {
  const { data: categories, isLoading } = useCategories();
  const total = categories?.reduce((s, c) => s + c.count, 0) ?? 0;
  const skins = filters.skin ?? [];
  const toggleSkin = (k: SkinType) => (skins.includes(k) ? skins.filter((x) => x !== k) : [...skins, k]).join(',');

  return (
    <aside className={cn('filters', open && 'open')} id={id} aria-label="Filtrlar">
      <div className="fbox">
        <h4>Toifa</h4>
        <div className="flist">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} style={{ height: 38 }} />)
            : (
              <>
                <Link to={urlWith({ cat: '' })} replace className={cn(!filters.category && 'on')}>
                  Hammasi <small>{total}</small>
                </Link>
                {categories?.map((c) => (
                  <Link key={c.id} to={urlWith({ cat: c.id })} replace className={cn(filters.category === c.id && 'on')}>
                    {c.name} <small>{c.count}</small>
                  </Link>
                ))}
              </>
            )}
        </div>
      </div>

      <div className="fbox">
        <h4>Narx</h4>
        <ChipGroup>
          {PRICE_RANGES.map(([label, a, b]) => (
            <Chip key={label} replace to={urlWith({ min: a, max: b })} active={(filters.min ?? 0) === a && (filters.max ?? 0) === b}>
              {label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="fbox">
        <h4>Teri turi</h4>
        <ChipGroup>
          {(Object.entries(SKIN_LABELS) as [SkinType, string][]).map(([k, label]) => (
            <Chip key={k} replace to={urlWith({ skin: toggleSkin(k) })} active={skins.includes(k)}>
              {label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="fbox">
        <h4>Aksiya</h4>
        <ChipGroup>
          <Chip replace to={urlWith({ sale: filters.sale ? '' : '1' })} active={!!filters.sale}>
            Faqat chegirmadagilar
          </Chip>
        </ChipGroup>
      </div>

      {hasActive && <Button variant="soft" to="/shop">Filtrlarni tozalash</Button>}
    </aside>
  );
}
