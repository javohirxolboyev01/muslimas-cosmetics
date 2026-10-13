/**
 * Server tomonidagi validatsiya sxemalari (API kirishlari uchun).
 * Admin formalari o'z sxemalariga ega (string → number konvertatsiyasi bilan),
 * bular esa tayyor JSON'ni qat'iy tekshiradi.
 */
import { z } from 'zod';
import { DELIVERY_METHODS, ORDER_STATUSES, PAYMENT_METHODS, PRODUCT_SHAPES, SKIN_TYPES } from './entities';
import { MAX_QTY } from './constants';
import { isValidPhone } from './phone';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'HEX rang (#aabbcc)');
const money = z.number().int().min(0);

export const variantSchema = z
  .object({
    label: z.string().trim().min(1, 'Nomini kiriting').max(40),
    price: z.number().int().positive('0 dan katta'),
    oldPrice: z.number().int().positive().optional(),
  })
  .refine((v) => !v.oldPrice || v.oldPrice > v.price, { message: "Eski narx joriy narxdan katta bo'lsin", path: ['oldPrice'] });

export const productInputSchema = z.object({
  name: z.string().trim().min(3, 'Kamida 3 belgi').max(80),
  categoryId: z.string().trim().min(1, 'Toifani tanlang'),
  shape: z.enum(PRODUCT_SHAPES),
  color1: hex,
  color2: hex,
  bg: hex,
  tag: z.string().trim().max(12),
  skin: z.array(z.enum(SKIN_TYPES)),
  variants: z.array(variantSchema).min(1, 'Kamida bitta variant').max(6),
  description: z.string().trim().min(10, 'Kamida 10 belgi').max(2000),
  ingredients: z.string().trim().min(3).max(1000),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
});
export const productPatchSchema = productInputSchema.partial();

export const categorySchema = z.object({
  id: z.string().trim().min(2).max(40).regex(/^[a-z0-9-]+$/, "Faqat kichik lotin harflari, raqam va '-'"),
  name: z.string().trim().min(2).max(40),
  emoji: z.string().trim().min(1).max(8),
  bg: hex,
});
export const categoryUpdateSchema = categorySchema.omit({ id: true });

export const couponInputSchema = z.object({
  code: z.string().trim().min(3).max(20).regex(/^[A-Za-z0-9]+$/, 'Faqat lotin harf va raqam').transform((s) => s.toUpperCase()),
  percent: z.number().int().min(1).max(90),
  isActive: z.boolean(),
});
export const couponPatchSchema = z.object({
  percent: z.number().int().min(1).max(90).optional(),
  isActive: z.boolean().optional(),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(9).max(30),
  wa: z.string().regex(/^\d{12}$/, "998901234567 ko'rinishida, 12 ta raqam"),
  tg: z.string().trim().regex(/^[A-Za-z0-9_]{4,32}$/, 'Username (@ belgisisiz)'),
  ig: z.string().trim().regex(/^[A-Za-z0-9_.]{2,30}$/, 'Username (@ belgisisiz)'),
  hours: z.string().trim().min(3).max(40),
  city: z.string().trim().min(2).max(40),
  freeFrom: money,
  shipCourier: money,
  shipPost: money,
  pickupAddress: z.string().trim().min(3).max(200),
  welcomeCoupon: z.string().trim().max(20).transform((s) => s.toUpperCase()),
});

export const orderPatchSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    adminNote: z.string().max(1000).optional(),
  })
  .refine((v) => v.status !== undefined || v.adminNote !== undefined, { message: "O'zgartirish uchun maydon yo'q" });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("To'g'ri email kiriting"),
  password: z.string().min(1, 'Parolni kiriting').max(200),
});

export const createOrderSchema = z.object({
  name: z.string().trim().min(3, 'Ismingizni kiriting').max(80),
  phone: z.string().refine(isValidPhone, "Raqamni to'liq kiriting (9 ta raqam)"),
  region: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2, 'Shahar yoki tumanni kiriting').max(80),
  addr: z.string().trim().min(4, 'Manzilni kiriting').max(300),
  note: z.string().trim().max(500).default(''),
  delivery: z.enum(DELIVERY_METHODS),
  pay: z.enum(PAYMENT_METHODS),
  coupon: z.string().trim().max(20).default('').transform((s) => s.toUpperCase()),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variant: z.number().int().min(0),
        qty: z.number().int().min(1).max(MAX_QTY),
      }),
    )
    .min(1, "Savat bo'sh")
    .max(50),
});

export const orderLookupSchema = z.object({
  refs: z
    .array(z.object({ no: z.string().trim().max(20), phone: z.string().max(30) }))
    .max(50),
});
