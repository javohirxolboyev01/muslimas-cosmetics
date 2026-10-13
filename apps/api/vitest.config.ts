import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://localhost:5432/muslima_cosmetics_test',
      JWT_SECRET: 'test-secret-test-secret-test-secret-123',
      TELEGRAM_BOT_TOKEN: '',
      TELEGRAM_CHAT_ID: '',
    },
    globalSetup: './test/global-setup.ts',
    fileParallelism: false,
  },
});
