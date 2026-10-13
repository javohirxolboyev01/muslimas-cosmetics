import { ApiError } from '@/shared/api/ApiError';
import type { AdminUser } from '@/shared/types';
import type { MockRequest, MockRoute } from '../router';

const ADMIN: AdminUser = { id: 1, name: 'Muslima', email: 'admin@muslima.uz' };
const PASSWORD = 'admin123';

export const authRoutes: MockRoute[] = [
  {
    method: 'POST',
    path: '/auth/login',
    handler: ({ body }: MockRequest<{ email: string; password: string }>) => {
      if (body.email.trim().toLowerCase() !== ADMIN.email || body.password !== PASSWORD) {
        throw new ApiError(401, "Email yoki parol noto'g'ri");
      }
      return { token: `mock.${btoa(ADMIN.email)}.${Date.now()}`, user: ADMIN };
    },
  },
  { method: 'GET', path: '/auth/me', handler: () => ADMIN },
];
