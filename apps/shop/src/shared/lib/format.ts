/** 189000 → "189 000 so'm" */
export const formatPrice = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";

export const discountPercent = (price: number, oldPrice?: number) =>
  oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0;

export const formatDate = (iso: string, withTime = false) =>
  withTime ? new Date(iso).toLocaleString('uz-UZ') : new Date(iso).toLocaleDateString('uz-UZ');
