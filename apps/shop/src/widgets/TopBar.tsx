import { useShop } from '@/config/shop';
import { formatPrice } from '@/shared/lib/format';
import './Header.css';

export function TopBar() {
  const SHOP = useShop();
  return (
    <div className="topbar">
      <span>{formatPrice(SHOP.freeFrom)} dan yuqori buyurtmalarga Toshkent bo'ylab bepul yetkazish</span>
      {SHOP.welcomePercent > 0 && (
        <>
          <span className="topbar-sep"> · </span>
          <span>Birinchi xaridga {SHOP.welcomeCoupon} kodi bilan −{SHOP.welcomePercent}%</span>
        </>
      )}
    </div>
  );
}
