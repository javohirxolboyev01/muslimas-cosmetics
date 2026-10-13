import { storage } from '@/shared/lib/storage';
import type { Category, Coupon, Order, Product, ShopSettings } from '@/shared/types';
import { seedOrders } from './seed/orders';
import { seedCategories, seedProducts } from './seed/products';

export interface DbShape {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  settings: ShopSettings;
}

const KEY = 'mc_admin_mock_db_v1';

function createSeed(): DbShape {
  const now = Date.now();
  const products = seedProducts(now);
  return {
    products,
    categories: seedCategories,
    orders: seedOrders(products, now),
    coupons: [
      { code: 'GLOW15', percent: 15, isActive: true, usageCount: 12 },
      { code: 'BAHOR10', percent: 10, isActive: false, usageCount: 4 },
    ],
    settings: {
      name: "Muslima's Cosmetics",
      phone: '+998 90 000 00 00',
      wa: '998900000000',
      tg: 'muslimas_cosmetics',
      ig: 'muslimas_cosmetics',
      hours: '09:00 – 21:00',
      city: 'Toshkent',
      freeFrom: 500000,
      shipCourier: 25000,
      shipPost: 35000,
      pickupAddress: 'Manzil buyurtma tasdiqlanganda xabar qilinadi',
      welcomeCoupon: 'GLOW15',
    },
  };
}

const loaded = storage.get<DbShape | null>(KEY, null);
let state: DbShape = loaded ? { ...loaded, settings: { ...createSeed().settings, ...loaded.settings } } : createSeed();

/** Oddiy in-memory "ma'lumotlar bazasi"; har o'zgarishdan keyin localStorage'ga yoziladi. */
export const db = {
  get data(): Readonly<DbShape> {
    return state;
  },
  write(mutator: (draft: DbShape) => void) {
    mutator(state);
    storage.set(KEY, state);
  },
  reset() {
    state = createSeed();
    storage.set(KEY, state);
  },
};
