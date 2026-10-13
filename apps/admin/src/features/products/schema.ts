import { z } from 'zod';
import type { Product, ProductShape, SkinType } from '@/shared/types';
import type { ProductInput } from './api';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'HEX rang (#aabbcc)');
const emptyToUndefined = (v: unknown) => (v === '' || v === null || v === undefined ? undefined : Number(v));

const variantSchema = z
  .object({
    label: z.string().trim().min(1, 'Nomini kiriting'),
    price: z.preprocess(emptyToUndefined, z.number({ required_error: 'Narxni kiriting', invalid_type_error: 'Raqam kiriting' }).int().positive('0 dan katta')),
    oldPrice: z.preprocess(emptyToUndefined, z.number({ invalid_type_error: 'Raqam kiriting' }).int().positive().optional()),
  })
  .refine((v) => !v.oldPrice || v.oldPrice > v.price, { message: 'Eski narx joriy narxdan katta bo‘lsin', path: ['oldPrice'] });

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Kamida 3 belgi').max(80, 'Juda uzun'),
  categoryId: z.string().min(1, 'Toifani tanlang'),
  shape: z.enum(['serum', 'bottle', 'jar', 'tube', 'sun', 'mask', 'lip', 'cushion'] as [ProductShape, ...ProductShape[]]),
  color1: hex,
  color2: hex,
  bg: hex,
  image: z.string(),
  tag: z.string().trim().max(12, 'Ko‘pi bilan 12 belgi'),
  skin: z.array(z.enum(['quruq', 'yogli', 'aralash', 'sezgir', 'normal'] as [SkinType, ...SkinType[]])),
  variants: z.array(variantSchema).min(1, 'Kamida bitta variant').max(6),
  description: z.string().trim().min(10, 'Kamida 10 belgi'),
  ingredients: z.string().trim().min(3, 'Tarkibni kiriting'),
  stock: z.preprocess(emptyToUndefined, z.number({ required_error: 'Qoldiqni kiriting' }).int('Butun son').min(0)),
  isActive: z.boolean(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const emptyProduct: ProductFormValues = {
  name: '',
  categoryId: '',
  shape: 'serum',
  color1: '#ffd0e1',
  color2: '#f0508a',
  bg: '#fff0f5',
  image: '',
  tag: '',
  skin: [],
  variants: [{ label: '30 ml', price: 0, oldPrice: undefined }],
  description: '',
  ingredients: '',
  stock: 0,
  isActive: true,
};

export const toFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  categoryId: p.categoryId,
  shape: p.shape,
  color1: p.color1,
  color2: p.color2,
  bg: p.bg,
  image: p.image ?? '',
  tag: p.tag,
  skin: p.skin,
  variants: p.variants.map((v) => ({ label: v.label, price: v.price, oldPrice: v.oldPrice })),
  description: p.description,
  ingredients: p.ingredients,
  stock: p.stock,
  isActive: p.isActive,
});

export const toInput = (v: ProductFormValues): ProductInput => ({
  ...v,
  variants: v.variants.map(({ oldPrice, ...rest }) => (oldPrice ? { ...rest, oldPrice } : rest)),
});
