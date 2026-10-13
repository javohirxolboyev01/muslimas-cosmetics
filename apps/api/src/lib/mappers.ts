import type { Order, Product, PublicOrder, PublicProduct } from '@mc/shared';
import type { OrderRow, ProductRow } from '../db/schema';

export const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  categoryId: r.categoryId,
  shape: r.shape,
  color1: r.color1,
  color2: r.color2,
  bg: r.bg,
  tag: r.tag,
  skin: r.skin,
  variants: r.variants,
  description: r.description,
  ingredients: r.ingredients,
  popularity: r.popularity,
  stock: r.stock,
  isActive: r.isActive,
  createdAt: r.createdAt.toISOString(),
});

export const toPublicProduct = (r: ProductRow): PublicProduct => ({
  id: r.id,
  name: r.name,
  categoryId: r.categoryId,
  shape: r.shape,
  color1: r.color1,
  color2: r.color2,
  bg: r.bg,
  tag: r.tag,
  skin: r.skin,
  variants: r.variants,
  description: r.description,
  ingredients: r.ingredients,
  price: r.variants[0]?.price ?? 0,
  ...(r.variants[0]?.oldPrice ? { oldPrice: r.variants[0].oldPrice } : {}),
  inStock: r.stock > 0,
});

export const toOrder = (r: OrderRow): Order => ({
  no: r.no,
  date: r.createdAt.toISOString(),
  status: r.status,
  name: r.name,
  phone: r.phone,
  region: r.region,
  city: r.city,
  addr: r.addr,
  note: r.note,
  delivery: r.delivery,
  pay: r.pay,
  items: r.items,
  sub: r.sub,
  disc: r.disc,
  ship: r.ship,
  total: r.total,
  coupon: r.coupon,
  adminNote: r.adminNote,
});

export const toPublicOrder = (r: OrderRow): PublicOrder => {
  const { adminNote: _ignored, ...rest } = toOrder(r);
  return rest;
};
