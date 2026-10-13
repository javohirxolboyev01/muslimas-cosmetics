import { z } from 'zod';
import type { Paginated } from '@mc/shared';

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10),
});

/** Avval umumiy sonni bilib, so'ralgan sahifani chegaraga keltiradi (mock bilan bir xil xatti-harakat) */
export function pageWindow(total: number, page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(page, pageCount);
  return { page: p, pageCount, offset: (p - 1) * pageSize, limit: pageSize };
}

export const paginated = <T>(items: T[], total: number, w: { page: number; pageCount: number }, pageSize: number): Paginated<T> => ({
  items, total, page: w.page, pageSize, pageCount: w.pageCount,
});

/** LIKE uchun maxsus belgilarni ekranlash */
export const likePattern = (s: string) => `%${s.trim().replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
