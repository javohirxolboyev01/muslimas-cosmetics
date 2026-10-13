import type { HttpMethod, QueryParams } from '@/shared/api/http';

export interface MockRequest<B = unknown> {
  params: Record<string, string>;
  query: QueryParams;
  body: B;
}

export type MockHandler = (req: MockRequest<any>) => unknown; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface MockRoute {
  method: HttpMethod;
  path: string;
  handler: MockHandler;
}

interface CompiledRoute extends MockRoute {
  regex: RegExp;
  keys: string[];
}

/** "/products/:id" -> /^\/products\/([^/]+)$/ */
const compile = (route: MockRoute): CompiledRoute => {
  const keys: string[] = [];
  const pattern = route.path.replace(/:(\w+)/g, (_, k: string) => {
    keys.push(k);
    return '([^/]+)';
  });
  return { ...route, keys, regex: new RegExp(`^${pattern}$`) };
};

export const createRouter = (routes: MockRoute[]) => {
  const compiled = routes.map(compile);
  return (method: HttpMethod, path: string) => {
    for (const r of compiled) {
      if (r.method !== method) continue;
      const m = path.match(r.regex);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return { handler: r.handler, params };
    }
    return null;
  };
};
