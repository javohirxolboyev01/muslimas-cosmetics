import { useQuery } from '@tanstack/react-query';
import { HOME_REGION, MAX_QTY, type PublicSettings } from '@mc/shared';
import { catalogService } from '@/services/catalog.service';

export { HOME_REGION, MAX_QTY };

/**
 * Do'kon sozlamalari admin paneldan boshqariladi (GET /public/settings).
 * Bu qiymatlar faqat birinchi yuklanish paytida (yoki API ishlamasa) ko'rsatiladi.
 */
export const SHOP_DEFAULTS: PublicSettings = {
  name: "Muslima's Cosmetics",
  phone: '+998 90 000 00 00',
  wa: '998900000000',
  tg: 'muslimas_cosmetics',
  ig: 'muslimas_cosmetics',
  hours: '09:00 – 21:00',
  city: 'Toshkent',
  freeFrom: 500_000,
  shipCourier: 25_000,
  shipPost: 35_000,
  pickupAddress: 'Manzil buyurtma tasdiqlanganda xabar qilinadi',
  welcomeCoupon: '',
  welcomePercent: 0,
};

export const shopQueryKey = ['shop', 'settings'] as const;

export const shopQuery = {
  queryKey: shopQueryKey,
  queryFn: ({ signal }: { signal: AbortSignal }) => catalogService.settings(signal),
  staleTime: 5 * 60 * 1000,
};

/** Joriy do'kon sozlamalari (yuklanguncha — SHOP_DEFAULTS) */
export function useShop(): PublicSettings {
  return useQuery(shopQuery).data ?? SHOP_DEFAULTS;
}
