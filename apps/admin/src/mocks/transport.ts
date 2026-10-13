import { ApiError } from '@/shared/api/ApiError';
import type { TransportRequest } from '@/shared/api/http';
import { authToken } from '@/shared/lib/authToken';
import { authRoutes } from './handlers/auth';
import { categoryRoutes } from './handlers/categories';
import { couponRoutes } from './handlers/coupons';
import { customerRoutes } from './handlers/customers';
import { dashboardRoutes } from './handlers/dashboard';
import { orderRoutes } from './handlers/orders';
import { productRoutes } from './handlers/products';
import { settingsRoutes } from './handlers/settings';
import { createRouter } from './router';

const match = createRouter([
  ...authRoutes,
  ...dashboardRoutes,
  ...productRoutes,
  ...categoryRoutes,
  ...orderRoutes,
  ...customerRoutes,
  ...couponRoutes,
  ...settingsRoutes,
]);

const PUBLIC_PATHS = new Set(['/auth/login']);

/** Tarmoq kechikishini taqlid qiladi va abort signalini hurmat qiladi */
const latency = (signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 250 + Math.random() * 450);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });

let requestCount = 0;

export async function mockTransport<T>({ method, path, params = {}, body, signal }: TransportRequest): Promise<T> {
  requestCount += 1;
  // Dedup ishlayotganini DevTools konsolida ko'rish uchun
  console.debug(`%c[mock #${requestCount}] ${method} ${path}`, 'color:#d93573', params);

  await latency(signal);

  if (!PUBLIC_PATHS.has(path) && !authToken.get()) throw new ApiError(401, 'Avtorizatsiyadan o‘ting');

  const route = match(method, path);
  if (!route) throw new ApiError(404, `${method} ${path} topilmadi`);

  const result = route.handler({ params: route.params, query: params, body });
  // Komponentlar mock DB obyektlarini to'g'ridan-to'g'ri o'zgartirib qo'ymasligi uchun nusxa
  return (result === undefined ? null : structuredClone(result)) as T;
}
