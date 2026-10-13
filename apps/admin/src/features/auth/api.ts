import { http } from '@/shared/api/http';
import type { AdminUser } from '@/shared/types';

export interface LoginPayload { email: string; password: string }
export interface LoginResponse { token: string; user: AdminUser }

export const authApi = {
  login: (payload: LoginPayload) => http.post<LoginResponse>('/auth/login', payload),
  me: (signal?: AbortSignal) => http.get<AdminUser>('/auth/me', { signal }),
};
