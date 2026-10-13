import { eq } from 'drizzle-orm';
import type { PublicSettings, ShopSettings } from '@mc/shared';
import type { DbOrTx } from '../db/client';
import { coupons, settings } from '../db/schema';

export const DEFAULT_SETTINGS: ShopSettings = {
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
  welcomeCoupon: 'GLOW15',
};

export async function getSettings(db: DbOrTx): Promise<ShopSettings> {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1));
  // Keyinroq qo'shilgan maydonlar eski yozuvda bo'lmasa — standart qiymat
  return { ...DEFAULT_SETTINGS, ...row?.data };
}

export async function saveSettings(db: DbOrTx, data: ShopSettings): Promise<ShopSettings> {
  await db
    .insert(settings)
    .values({ id: 1, data })
    .onConflictDoUpdate({ target: settings.id, set: { data, updatedAt: new Date() } });
  return data;
}

export async function getPublicSettings(db: DbOrTx): Promise<PublicSettings> {
  const s = await getSettings(db);
  let welcomePercent = 0;
  if (s.welcomeCoupon) {
    const [c] = await db.select().from(coupons).where(eq(coupons.code, s.welcomeCoupon));
    if (c?.isActive) welcomePercent = c.percent;
  }
  return { ...s, welcomePercent };
}
