/** Lotin harflaridagi URL qismi: "COSRX Snail 96 Essence" → "cosrx-snail-96-essence" */
export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['ʻʼ‘’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

/** Mahsulot sahifasi manzili: /product/12-cosrx-snail-96-essence (eski /product/12 ham ishlaydi) */
export function productPath(p: { id: number; name: string }): string {
  const s = slugify(p.name);
  return `/product/${p.id}${s ? `-${s}` : ''}`;
}

/** "/product/12-cosrx-..." dagi id qismi; topilmasa NaN */
export function productIdFromParam(param: string | undefined): number {
  const m = /^(\d+)(?:-|$)/.exec(param ?? '');
  return m ? Number(m[1]) : NaN;
}
