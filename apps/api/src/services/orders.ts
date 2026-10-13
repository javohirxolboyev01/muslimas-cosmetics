import { eq, inArray, sql } from 'drizzle-orm';
import {
  canTransition, formatPhone, HOME_REGION, orderTotals,
  type CreateOrderInput, type Order, type OrderItem, type OrderStatus,
} from '@mc/shared';
import type { Db, Tx } from '../db/client';
import { coupons, orders, products } from '../db/schema';
import { HttpError, notFound } from '../lib/errors';
import { toOrder } from '../lib/mappers';
import { getSettings } from './settings';

const randomNo = () => `MC-${Math.floor(100000 + Math.random() * 900000)}`;

/** Qoldiqni o'zgartirish (bekor qilinganda qaytarish uchun musbat, sotuvda manfiy) */
async function adjustStock(tx: Tx, items: OrderItem[], sign: 1 | -1) {
  const byProduct = new Map<number, number>();
  for (const it of items) byProduct.set(it.productId, (byProduct.get(it.productId) ?? 0) + it.qty);
  for (const [id, qty] of byProduct) {
    await tx.update(products).set({ stock: sql`${products.stock} + ${sign * qty}` }).where(eq(products.id, id));
  }
}

/**
 * Mijoz buyurtmasi. Narx, chegirma va yetkazish narxi faqat shu yerda hisoblanadi —
 * mijoz yuborgan summalarga ishonilmaydi. Qoldiq tranzaksiya ichida qulflanib kamaytiriladi.
 */
export async function createOrder(db: Db, input: CreateOrderInput): Promise<Order> {
  if (input.delivery === 'courier' && input.region !== HOME_REGION) {
    throw new HttpError(422, `Kuryer xizmati faqat ${HOME_REGION} uchun`, { delivery: '«Viloyatlarga yetkazish»ni tanlang' });
  }

  return db.transaction(async (tx) => {
    const settings = await getSettings(tx);

    const ids = [...new Set(input.items.map((i) => i.productId))];
    const rows = await tx.select().from(products).where(inArray(products.id, ids)).for('update');
    const byId = new Map(rows.map((r) => [r.id, r]));

    const wanted = new Map<number, number>();
    const items: OrderItem[] = input.items.map((it) => {
      const p = byId.get(it.productId);
      if (!p || !p.isActive) throw new HttpError(409, "Savatdagi ba'zi mahsulotlar endi sotuvda yo'q. Savatni yangilang.");
      const v = p.variants[it.variant];
      if (!v) throw new HttpError(409, `«${p.name}» varianti o'zgargan. Savatni yangilang.`);
      wanted.set(p.id, (wanted.get(p.id) ?? 0) + it.qty);
      return { productId: p.id, name: p.name, variantLabel: p.variants.length > 1 ? v.label : '', qty: it.qty, price: v.price };
    });

    for (const [id, qty] of wanted) {
      const p = byId.get(id)!;
      if (p.stock < qty) {
        throw new HttpError(409, p.stock > 0 ? `«${p.name}» dan faqat ${p.stock} ta qoldi` : `«${p.name}» tugagan`);
      }
    }

    let percent = 0;
    if (input.coupon) {
      const [c] = await tx.select().from(coupons).where(eq(coupons.code, input.coupon));
      if (!c?.isActive) throw new HttpError(422, 'Promokod yaroqsiz', { coupon: 'Promokod yaroqsiz yoki muddati tugagan' });
      percent = c.percent;
      await tx.update(coupons).set({ usageCount: sql`${coupons.usageCount} + 1` }).where(eq(coupons.code, c.code));
    }

    const totals = orderTotals(items, percent, input.delivery, settings);
    await adjustStock(tx, items, -1);

    const values = {
      name: input.name,
      phone: formatPhone(input.phone),
      region: input.region,
      city: input.city,
      addr: input.addr,
      note: input.note,
      delivery: input.delivery,
      pay: input.pay,
      items,
      ...totals,
      coupon: percent ? input.coupon : '',
    };

    // Raqam tasodifiy: ketma-ket bo'lmagani uchun boshqalarning buyurtmasini taxmin qilib bo'lmaydi
    for (let attempt = 0; attempt < 10; attempt++) {
      const [row] = await tx.insert(orders).values({ no: randomNo(), ...values }).onConflictDoNothing().returning();
      if (row) return toOrder(row);
    }
    throw new HttpError(500, 'Buyurtma raqamini yaratib bo‘lmadi');
  });
}

export async function updateOrder(db: Db, no: string, patch: { status?: OrderStatus; adminNote?: string }): Promise<Order> {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.no, no)).for('update');
    if (!current) return notFound('Buyurtma');

    if (patch.status && !canTransition(current.status, patch.status)) {
      throw new HttpError(409, "Bu holatga o'tkazib bo'lmaydi");
    }
    // Bekor qilingan buyurtmaning mahsulotlari omborga qaytadi
    if (patch.status === 'cancelled' && current.status !== 'cancelled') {
      await adjustStock(tx, current.items, 1);
    }

    const [row] = await tx
      .update(orders)
      .set({
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.adminNote !== undefined ? { adminNote: patch.adminNote } : {}),
      })
      .where(eq(orders.no, no))
      .returning();
    return toOrder(row);
  });
}
