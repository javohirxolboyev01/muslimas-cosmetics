import { sql } from 'drizzle-orm';
import { boolean, check, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import type {
  DeliveryMethod, OrderItem, OrderStatus, PaymentMethod, ProductShape, ShopSettings, SkinType, Variant,
} from '@mc/shared';

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  bg: text('bg').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    shape: text('shape').$type<ProductShape>().notNull(),
    color1: text('color1').notNull(),
    color2: text('color2').notNull(),
    bg: text('bg').notNull(),
    tag: text('tag').notNull().default(''),
    skin: text('skin').array().$type<SkinType[]>().notNull().default(sql`'{}'::text[]`),
    variants: jsonb('variants').$type<Variant[]>().notNull(),
    description: text('description').notNull(),
    ingredients: text('ingredients').notNull(),
    popularity: integer('popularity').notNull().default(50),
    stock: integer('stock').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('products_category_idx').on(t.categoryId),
    check('products_stock_nonneg', sql`${t.stock} >= 0`),
  ],
);

export const orders = pgTable(
  'orders',
  {
    no: text('no').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    status: text('status').$type<OrderStatus>().notNull().default('new'),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    region: text('region').notNull(),
    city: text('city').notNull(),
    addr: text('addr').notNull(),
    note: text('note').notNull().default(''),
    delivery: text('delivery').$type<DeliveryMethod>().notNull(),
    pay: text('pay').$type<PaymentMethod>().notNull(),
    items: jsonb('items').$type<OrderItem[]>().notNull(),
    sub: integer('sub').notNull(),
    disc: integer('disc').notNull(),
    ship: integer('ship').notNull(),
    total: integer('total').notNull(),
    coupon: text('coupon').notNull().default(''),
    adminNote: text('admin_note').notNull().default(''),
  },
  (t) => [
    index('orders_created_idx').on(t.createdAt),
    index('orders_status_idx').on(t.status),
    index('orders_phone_idx').on(t.phone),
  ],
);

export const coupons = pgTable('coupons', {
  code: text('code').primaryKey(),
  percent: integer('percent').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  usageCount: integer('usage_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Bitta qatorli jadval (id = 1) — do'kon sozlamalari */
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  data: jsonb('data').$type<ShopSettings>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type CouponRow = typeof coupons.$inferSelect;
