import { buildApp } from './app';
import { sqlClient } from './db/client';
import { env } from './env';

const app = await buildApp();

const shutdown = async (signal: string) => {
  app.log.info(`${signal} — to'xtatilmoqda`);
  await app.close();
  await sqlClient.end({ timeout: 5 });
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

await app.listen({ port: env.PORT, host: env.HOST });
