import type { FastifyPluginAsync } from 'fastify';
import { settingsSchema } from '@mc/shared';
import { db } from '../../db/client';
import { parse } from '../../lib/errors';
import { getSettings, saveSettings } from '../../services/settings';

export const settingsAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', () => getSettings(db));
  app.put('/', async (req) => saveSettings(db, parse(settingsSchema, req.body)));
};
