import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().default('postgres://localhost:5432/muslima_cosmetics'),
  PORT: z.coerce.number().int().default(8080),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET kamida 32 belgi bo‘lsin'),
  JWT_TTL: z.string().default('7d'),
  CORS_ORIGINS: z.string().default(''),
  /** Yuklangan rasmlar papkasi (apps/api ga nisbatan yoki absolyut yo'l) */
  UPLOAD_DIR: z.string().default('uploads'),
  SHOP_TZ: z.string().default('Asia/Tashkent'),
  /** Admin login. Berilsa, API har ishga tushganda shu email/parolni o'rnatadi (services/admin.ts) */
  ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL noto‘g‘ri').optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  ADMIN_NAME: z.string().trim().optional(),
  TELEGRAM_BOT_TOKEN: z.string().default(''),
  TELEGRAM_CHAT_ID: z.string().default(''),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Muhit o‘zgaruvchilari noto‘g‘ri:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
