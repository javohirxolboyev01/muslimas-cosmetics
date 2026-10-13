import { ProductCard } from './ProductCard';
import { Skeleton } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import type { Product } from '../model/types';
import './ProductGrid.css';

interface Props {
  products?: Product[];
  loading?: boolean;
  skeletonCount?: number;
  /** Fon rejimida yangilanayotganda (filtr o'zgarganda) xira ko'rsatish */
  dimmed?: boolean;
  /** Juda katta ekranlarda 5 ustun */
  wide?: boolean;
}

export function ProductGrid({ products, loading, skeletonCount = 4, dimmed, wide }: Props) {
  if (loading && !products) return <ProductGridSkeleton count={skeletonCount} />;
  return (
    <div className={cn('grid', dimmed && 'dim', wide && 'grid-wide')}>
      {products?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid" aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card card-skel">
          <Skeleton className="thumb" style={{ borderRadius: '999px 999px 18px 18px' }} />
          <Skeleton style={{ height: 12, width: '45%', margin: '16px 10px 8px' }} />
          <Skeleton style={{ height: 16, width: '80%', margin: '0 10px 8px' }} />
          <Skeleton style={{ height: 16, width: '40%', margin: '0 10px' }} />
          <Skeleton style={{ height: 44, margin: '14px 10px 0', borderRadius: 99 }} />
        </div>
      ))}
    </div>
  );
}
