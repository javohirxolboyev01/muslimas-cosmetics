/** localStorage o'rami — maxfiy rejim yoki bloklangan storage'da ham ishlaydi. */
const memory = new Map<string, unknown>();

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return memory.has(key) ? (memory.get(key) as T) : fallback;
  },
  set<T>(key: string, value: T): void {
    memory.set(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  cart: 'mc_cart',
  wish: 'mc_wish',
  orderRefs: 'mc_order_refs',
  recent: 'mc_rv',
  draft: 'mc_draft',
} as const;
