import { env } from '@/shared/config/env';
import { authToken } from '@/shared/lib/authToken';
import { ApiError } from './ApiError';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestConfig {
  params?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

export interface TransportRequest extends RequestConfig {
  method: HttpMethod;
  path: string;
}

/** Bo'sh qiymatlarni tashlab, kalitlarni saralab beradi — bir xil so'rov har doim bir xil URL beradi. */
export const toQueryString = (params?: QueryParams) => {
  if (!params) return '';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(entries).toString();
};

async function fetchTransport<T>({ method, path, params, body, signal }: TransportRequest): Promise<T> {
  const qs = toQueryString(params);
  const token = authToken.get();
  const res = await fetch(`${env.apiUrl}${path}${qs ? `?${qs}` : ''}`, {
    method,
    signal,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.message ?? `So'rov xatosi (${res.status})`, data?.errors);
  return data as T;
}

async function transport<T>(req: TransportRequest): Promise<T> {
  if (env.useMock) {
    // Dinamik import: VITE_USE_MOCK=false bo'lsa mock kodi umuman yuklanmaydi
    const { mockTransport } = await import('@/mocks/transport');
    return mockTransport<T>(req);
  }
  return fetchTransport<T>(req);
}

/* ------------------------------------------------------------------
 * GET so'rovlarni dedup qilish.
 * React Query bir xil queryKey uchun so'rovni o'zi birlashtiradi. Bu qatlam esa
 * turli joylardan (prefetch, boshqa key, qo'lda chaqiruv) kelgan AYNAN bir xil
 * GET so'rovni ham bitta tarmoq so'roviga birlashtiradi.
 * Tarmoq so'rovi faqat barcha "obunachilar" bekor qilgandagina abort qilinadi.
 * ------------------------------------------------------------------ */
interface InFlight {
  promise: Promise<unknown>;
  controller: AbortController;
  subscribers: number;
}
const inFlight = new Map<string, InFlight>();

function subscribe<T>(entry: InFlight, signal?: AbortSignal): Promise<T> {
  entry.subscribers += 1;
  if (!signal) return entry.promise as Promise<T>;

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      entry.subscribers -= 1;
      if (entry.subscribers <= 0) entry.controller.abort();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    if (signal.aborted) return onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
    entry.promise.then(
      (v) => { signal.removeEventListener('abort', onAbort); resolve(v as T); },
      (e) => { signal.removeEventListener('abort', onAbort); reject(e); },
    );
  });
}

function dedupedGet<T>(path: string, config: RequestConfig): Promise<T> {
  const key = `${path}?${toQueryString(config.params)}`;
  let entry = inFlight.get(key);
  if (!entry) {
    const controller = new AbortController();
    const promise = transport<T>({ method: 'GET', path, params: config.params, signal: controller.signal })
      .finally(() => inFlight.delete(key));
    entry = { promise, controller, subscribers: 0 };
    inFlight.set(key, entry);
  }
  return subscribe<T>(entry, config.signal);
}

export const http = {
  get: <T>(path: string, config: RequestConfig = {}) => dedupedGet<T>(path, config),
  post: <T>(path: string, body?: unknown) => transport<T>({ method: 'POST', path, body }),
  put: <T>(path: string, body?: unknown) => transport<T>({ method: 'PUT', path, body }),
  patch: <T>(path: string, body?: unknown) => transport<T>({ method: 'PATCH', path, body }),
  delete: <T = void>(path: string) => transport<T>({ method: 'DELETE', path }),
};
