import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyError } from 'fastify';
import { env, isProd } from './env';
import { requireAdmin } from './lib/auth';
import { HttpError } from './lib/errors';
import { categoryAdminRoutes } from './routes/admin/categories';
import { couponAdminRoutes } from './routes/admin/coupons';
import { customerAdminRoutes } from './routes/admin/customers';
import { dashboardAdminRoutes } from './routes/admin/dashboard';
import { orderAdminRoutes } from './routes/admin/orders';
import { productAdminRoutes } from './routes/admin/products';
import { settingsAdminRoutes } from './routes/admin/settings';
import { authRoutes } from './routes/auth';
import { publicRoutes } from './routes/public';
import { uploadAdminRoutes, uploadPublicRoutes } from './routes/uploads';
import { sqlClient } from './db/client';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: isProd ? 'info' : 'debug', redact: ['req.headers.authorization'] },
    trustProxy: true,
  });

  // Body'siz DELETE/POST so'rovlar `Content-Type: application/json` bilan kelsa ham xato bermasin
  app.removeContentTypeParser('application/json');
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (body === '') return done(null, undefined);
    try {
      done(null, JSON.parse(body as string));
    } catch {
      done(new HttpError(400, "JSON formati noto'g'ri"), undefined);
    }
  });

  const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  await app.register(cors, { origin: origins.length ? origins : false, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] });
  // global: false — limit faqat config.rateLimit berilgan marshrutlarga (login, buyurtma)
  if (env.NODE_ENV !== 'test') {
    await app.register(rateLimit, {
      global: false,
      errorResponseBuilder: (_req, ctx) => ({
        statusCode: ctx.statusCode,
        message: `Juda ko'p urinish. ${Math.ceil(ctx.ttl / 1000)} soniyadan keyin qayta urinib ko'ring`,
      }),
    });
  }

  app.setErrorHandler((err: FastifyError | HttpError, req, reply) => {
    if (err instanceof HttpError) {
      return reply.status(err.status).send({ message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
    }
    const status = err.statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    return reply.status(status).send({ message: status >= 500 ? 'Server xatosi. Keyinroq urinib ko‘ring' : err.message });
  });
  app.setNotFoundHandler((req, reply) => reply.status(404).send({ message: `${req.method} ${req.url} topilmadi` }));

  app.get('/api/health', async () => {
    await sqlClient`SELECT 1`;
    return { ok: true };
  });

  await app.register(publicRoutes, { prefix: '/api/public' });
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(uploadPublicRoutes, { prefix: '/api/uploads' });

  // Admin API: har bir so'rov JWT bilan himoyalangan
  await app.register(async (admin) => {
    admin.addHook('onRequest', async (req) => { await requireAdmin(req); });
    await admin.register(dashboardAdminRoutes, { prefix: '/dashboard' });
    await admin.register(productAdminRoutes, { prefix: '/products' });
    await admin.register(categoryAdminRoutes, { prefix: '/categories' });
    await admin.register(orderAdminRoutes, { prefix: '/orders' });
    await admin.register(customerAdminRoutes, { prefix: '/customers' });
    await admin.register(couponAdminRoutes, { prefix: '/coupons' });
    await admin.register(settingsAdminRoutes, { prefix: '/settings' });
    await admin.register(uploadAdminRoutes, { prefix: '/uploads' });
  }, { prefix: '/api' });

  return app;
}
