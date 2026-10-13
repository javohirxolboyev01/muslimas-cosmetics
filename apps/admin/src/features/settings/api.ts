import { http } from '@/shared/api/http';
import type { ShopSettings } from '@/shared/types';

export const settingsApi = {
  get: (signal?: AbortSignal) => http.get<ShopSettings>('/settings', { signal }),
  update: (input: ShopSettings) => http.put<ShopSettings>('/settings', input),
  resetDemo: () => http.post<void>('/settings/reset-demo'),
};
