import { formatPrice } from '@/shared/lib/format';
import './Summary.css';

interface Props {
  count: number;
  sub: number;
  disc: number;
  pct?: number;
  /** null — yetkazish narxi hali ma'lum emas */
  ship: number | null;
  net: number;
}

/** Mahsulotlar / chegirma / yetkazish / jami qatorlari — savat, checkout va buyurtma sahifasida qayta ishlatiladi. */
export function SummaryRows({ count, sub, disc, pct, ship, net }: Props) {
  return (
    <div className="sum-rows">
      <div className="row">
        <span>Mahsulotlar{count ? ` (${count})` : ''}</span>
        <span>{formatPrice(sub)}</span>
      </div>
      {disc > 0 && (
        <div className="row disc">
          <span>Chegirma{pct ? ` −${pct}%` : ''}</span>
          <span>−{formatPrice(disc)}</span>
        </div>
      )}
      <div className="row">
        <span>Yetkazib berish</span>
        <span>{ship === null ? 'Keyingi bosqichda' : ship ? formatPrice(ship) : 'Bepul'}</span>
      </div>
      <div className="row total">
        <span>Jami</span>
        <span>{formatPrice(net + (ship ?? 0))}</span>
      </div>
    </div>
  );
}
