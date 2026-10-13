import { Link } from 'react-router-dom';
import { useCategories } from '@/features/products';
import { SectionHeader, Skeleton } from '@/shared/ui';

export function CategoryRings() {
  const { data: cats, isLoading } = useCategories();
  return (
    <section className="s">
      <div className="wrap">
        <SectionHeader title="Nimani qidiryapsiz?" subtitle="Toifani tanlang va mahsulotlarni ko'ring." />
        <div className="cats">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <div className="cat" key={i}><Skeleton className="ring" style={{ borderRadius: '50%' }} /><Skeleton style={{ height: 14, width: '70%' }} /></div>
              ))
            : (
              <>
                {cats?.map((c) => (
                  <Link key={c.id} className="cat" to={`/shop?cat=${c.id}`}>
                    <span className="ring" style={{ background: c.bg }}>{c.emoji}</span>
                    {c.name}
                  </Link>
                ))}
                <Link className="cat" to="/shop">
                  <span className="ring" style={{ background: 'var(--pink-soft)' }}>🌸</span>
                  Hammasi
                </Link>
              </>
            )}
        </div>
      </div>
    </section>
  );
}
