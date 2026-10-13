import type { ZodError, ZodType, ZodTypeDef } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Resurs'): never => {
  throw new HttpError(404, `${what} topilmadi`);
};

export const zodFieldErrors = (e: ZodError) => {
  const out: Record<string, string> = {};
  for (const issue of e.issues) {
    const key = issue.path.join('.') || '_';
    const missing = issue.code === 'invalid_type' && issue.received === 'undefined';
    out[key] ??= missing ? "To'ldirilishi shart" : issue.message;
  }
  return out;
};

/** Kirish ma'lumotini sxema bo'yicha tekshiradi; xato bo'lsa 422 + maydon xatolari */
export function parse<T>(schema: ZodType<T, ZodTypeDef, unknown>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpError(422, "Ma'lumotlar noto'g'ri", zodFieldErrors(r.error));
  return r.data;
}
