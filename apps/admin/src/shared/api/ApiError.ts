export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export const getErrorMessage = (e: unknown) => {
  if (isApiError(e)) return e.message;
  if (e instanceof Error && e.name !== 'AbortError') return e.message;
  return "Noma'lum xatolik yuz berdi";
};
