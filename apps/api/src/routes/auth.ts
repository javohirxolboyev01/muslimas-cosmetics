import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { FastifyPluginAsync } from 'fastify';
import { loginSchema, type AdminUser } from '@mc/shared';
import { db } from '../db/client';
import { admins } from '../db/schema';
import { requireAdmin, signToken } from '../lib/auth';
import { HttpError, parse } from '../lib/errors';

// Email mavjud bo'lmaganda ham bcrypt ishlaydi — javob vaqti orqali email'ni bilib bo'lmasin
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/login',
    { config: { rateLimit: { max: 10, timeWindow: '5 minutes' } } },
    async (req) => {
      const { email, password } = parse(loginSchema, req.body);
      const [admin] = await db.select().from(admins).where(eq(admins.email, email));
      const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
      if (!admin || !ok) throw new HttpError(401, "Email yoki parol noto'g'ri");
      const user: AdminUser = { id: admin.id, name: admin.name, email: admin.email };
      return { token: await signToken(admin.id, admin.passwordHash), user };
    },
  );

  app.get('/me', async (req): Promise<AdminUser> => {
    const id = await requireAdmin(req);
    const [admin] = await db.select({ id: admins.id, name: admins.name, email: admins.email }).from(admins).where(eq(admins.id, id));
    if (!admin) throw new HttpError(401, 'Foydalanuvchi topilmadi');
    return admin;
  });
};
