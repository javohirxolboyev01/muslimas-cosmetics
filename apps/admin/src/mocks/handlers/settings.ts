import type { ShopSettings } from '@/shared/types';
import { db } from '../db';
import type { MockRequest, MockRoute } from '../router';

export const settingsRoutes: MockRoute[] = [
  { method: 'GET', path: '/settings', handler: () => db.data.settings },
  {
    method: 'PUT',
    path: '/settings',
    handler: ({ body }: MockRequest<ShopSettings>) => {
      db.write((d) => { d.settings = body; });
      return db.data.settings;
    },
  },
  {
    method: 'POST',
    path: '/settings/reset-demo',
    handler: () => { db.reset(); },
  },
];
