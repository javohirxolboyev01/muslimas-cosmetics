import { useShop } from '@/config/shop';
import { formatPrice } from '@/shared/lib/format';
import './Summary.css';

export function FreeShippingProgress({ net }: { net: number }) {
  const SHOP = useShop();
  const left = Math.max(0, SHOP.freeFrom - net);
  const pct = Math.min(100, (net / SHOP.freeFrom) * 100);
  return (
    <div className="free">
      {left > 0
        ? `Toshkent bo'ylab bepul yetkazishgacha yana ${formatPrice(left)} qoldi`
        : "Toshkent bo'ylab bepul yetkazib berish yoqildi 🎉"}
      <div className="bar" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
