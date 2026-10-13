# Muslima's Cosmetics — React

Vite + React 19 + TypeScript + TanStack Query + React Router + Zustand.

Ishga tushirish, backend va deploy — [ildizdagi README](../../README.md).

```bash
npm run dev -w @mc/shop     # http://localhost:5173 (API: localhost:8080, Vite proxy orqali)
npm run build -w @mc/shop   # typecheck + production build
```

## Arxitektura

```
src/
├── app/               # ilova "yig'uvchi" qatlam: providers, router, RootLayout
├── config/            # useShop() — do'kon sozlamalari API'dan; qo'llash usullari; navigatsiya
├── services/          # API qatlami (fetch → /api/public/*)
├── features/          # biznes-funksiyalar — har biri o'z model/hooks/components bilan
│   ├── products/      #   queryKeys, useProducts/useProduct/..., ProductCard, ProductGrid, ProductArt
│   ├── catalog/       #   URL ↔ filtrlar (useShopFilters), FiltersSidebar, ShopToolbar
│   ├── cart/          #   zustand store (persist), computeTotals, useCart, summary komponentlari
│   ├── wishlist/      #   store, WishButton
│   ├── orders/        #   useOrders/useOrder/useCreateOrder, buyurtma raqam+telefon (localStorage)
│   ├── checkout/      #   forma holati, validatsiya, yetkazish/to'lov variantlari
│   ├── search/        #   qidiruv oynasi (debounce + useQuery)
│   └── recently-viewed/
├── widgets/           # sahifa bloklari: Header, Footer, BottomNav, TopBar, FamilyBanner
├── pages/             # route komponentlari (lazy-load), faqat feature'larni yig'adi
├── shared/            # hech narsaga bog'liq bo'lmagan qayta ishlatiladigan kod
│   ├── ui/            #   Button, Chip, Panel, FormField, Accordion, RadioCard, EmptyState, ...
│   ├── api/           #   http klient, ApiError
│   ├── lib/           #   format, phone, storage, clipboard, messenger
│   ├── hooks/         #   useDocumentTitle, useDebouncedValue, useLockBodyScroll, ...
│   └── toast/         #   global toast (komponentdan tashqarida ham: toast("..."))
└── styles/            # tokens.css (ranglar, shriftlar) + base.css
```

**Bog'liqlik yo'nalishi:** `app → pages → widgets → features → shared`. Pastki qatlam yuqoridagini import qilmaydi.

### Ma'lumot oqimi
- **Server holati** (mahsulotlar, toifalar, sozlamalar, buyurtmalar) → TanStack Query. Kalitlar `features/*/queryKeys.ts` da.
- **Buyurtmalar** → serverda. Qurilmada faqat `{ no, phone }` juftliklari saqlanadi (`mc_order_refs`).
- **Narxlar** → savatdagi hisob faqat oldindan ko'rsatish uchun. Yakuniy summani server `@mc/shared` dagi xuddi shu formula bilan hisoblaydi.
- **Client holati** (savat, sevimlilar, ko'rilganlar) → Zustand + `persist` (localStorage).
- **Filtrlar** → URL query (`/shop?cat=serum&sort=asc`), havolani ulashish mumkin.

### Responsivlik
320px → 2200px+: 380 / 640 / 860 / 960 / 1100 / 1600 / 2200 breakpoint'lar.
Mobilda pastki navigatsiya, burger menyu, filtrlar paneli, kartochkaga aylanadigan jadval; katta ekranlarda kengroq konteyner va shrift.
