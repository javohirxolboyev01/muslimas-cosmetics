import { buildApp } from './app';
import { sqlClient } from './db/client';
import { env, isProd } from './env';
import { syncAdmin } from './services/admin';

const app = await buildApp();

if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
  const result = await syncAdmin(env.ADMIN_EMAIL, env.ADMIN_PASSWORD, env.ADMIN_NAME);
  app.log.info(`admin (${env.ADMIN_EMAIL}): ${result}`);
  if (isProd && env.ADMIN_PASSWORD.length < 8) app.log.warn('ADMIN_PASSWORD juda qisqa — kamida 8 belgi tavsiya qilinadi');
}

const shutdown = async (signal: string) => {
  app.log.info(`${signal} — to'xtatilmoqda`);
  await app.close();
  await sqlClient.end({ timeout: 5 });
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

await app.listen({ port: env.PORT, host: env.HOST });
