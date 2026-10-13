import { storage } from './storage';

const KEY = 'mc_admin_token';

export const authToken = {
  get: () => storage.get<string | null>(KEY, null),
  set: (token: string) => storage.set(KEY, token),
  clear: () => storage.remove(KEY),
};
