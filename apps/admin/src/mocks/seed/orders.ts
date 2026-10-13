import { REGIONS } from '@/shared/config/constants';
import type { Order, OrderStatus, Product } from '@/shared/types';

/** Deterministik tasodifiy generator — har safar bir xil seed ma'lumot */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const NAMES = [
  'Madina Karimova', 'Dilnoza Rahimova', 'Sevara Usmonova', 'Nilufar Tursunova', 'Malika Abdullayeva',
  'Zarina Yusupova', 'Shahnoza Ergasheva', 'Gulnoza Saidova', 'Kamola Nazarova', 'Feruza Qodirova',
  'Mohira Islomova', 'Laylo Xasanova', 'Durdona Aliyeva', 'Nodira Sobirova', 'Barno Mirzayeva',
];
const CITIES: Record<string, string> = {
  'Toshkent shahri': 'Chilonzor tumani',
  Samarqand: 'Samarqand shahri',
  Andijon: 'Andijon shahri',
  "Farg'ona": "Marg'ilon",
  Buxoro: 'Buxoro shahri',
  Namangan: 'Namangan shahri',
};
const DAY = 86_400_000;

export function seedOrders(products: Product[], now: number): Order[] {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const phones = NAMES.map((_, i) => `+998 9${i % 10} ${100 + i * 37} ${10 + i * 3} ${20 + i * 5}`);
  const orders: Order[] = [];
  const usedNos = new Set<string>();

  for (let i = 0; i < 64; i++) {
    const ci = Math.floor(rand() * NAMES.length);
    const daysAgo = Math.floor(Math.pow(rand(), 1.4) * 45);
    const date = new Date(now - daysAgo * DAY - Math.floor(rand() * DAY * 0.6));
    const region = rand() < 0.6 ? 'Toshkent shahri' : pick(REGIONS.filter((r) => r in CITIES));

    const items = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
      const p = pick(products);
      const v = pick(p.variants);
      return {
        productId: p.id,
        name: p.name,
        variantLabel: p.variants.length > 1 ? v.label : '',
        qty: 1 + Math.floor(rand() * 2),
        price: v.price,
      };
    });
    const sub = items.reduce((s, x) => s + x.price * x.qty, 0);
    const coupon = rand() < 0.2 ? 'GLOW15' : '';
    const disc = coupon ? Math.round(sub * 0.15) : 0;
    const delivery = region === 'Toshkent shahri' ? (rand() < 0.85 ? 'courier' : 'pickup') : 'post';
    const ship = delivery === 'pickup' ? 0 : delivery === 'post' ? 35000 : sub - disc >= 500000 ? 0 : 25000;

    let status: OrderStatus;
    if (daysAgo <= 1) status = rand() < 0.7 ? 'new' : 'processing';
    else if (daysAgo <= 3) status = pick(['processing', 'shipping', 'shipping']);
    else status = rand() < 0.1 ? 'cancelled' : 'delivered';

    let no = `MC-${String(date.getTime()).slice(-6)}`;
    while (usedNos.has(no)) no = `MC-${String(Number(no.slice(3)) + 1).padStart(6, '0')}`;
    usedNos.add(no);

    orders.push({
      no,
      date: date.toISOString(),
      status,
      name: NAMES[ci],
      phone: phones[ci],
      region,
      city: CITIES[region],
      addr: `${pick(['Bunyodkor', 'Navoiy', 'Amir Temur', 'Mustaqillik', 'Bobur'])} ko'chasi, ${1 + Math.floor(rand() * 90)}-uy`,
      note: rand() < 0.25 ? "Qo'ng'iroq qilib keling" : '',
      delivery,
      pay: rand() < 0.65 ? 'cash' : 'card',
      items,
      sub,
      disc,
      ship,
      total: sub - disc + ship,
      coupon,
    });
  }
  return orders.sort((a, b) => b.date.localeCompare(a.date));
}
