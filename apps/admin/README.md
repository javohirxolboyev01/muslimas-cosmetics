# Muslima's Cosmetics — Admin panel

React 19 + TypeScript + Vite + TanStack Query v5 + React Router v7 + React Hook Form + Zod.
Backend — `apps/api` (ishga tushirish va deploy: [ildizdagi README](../../README.md)).

```bash
npm run dev -w @mc/admin     # http://localhost:5174 (API: localhost:8080, Vite proxy orqali)
npm run build -w @mc/admin   # typecheck + production build
```

Dev kirish: `admin@muslima.uz` / `admin123` (`apps/api/.env` dagi `ADMIN_*`, `npm run db:seed`)

## Mock rejimi (backendsiz)

`.env` faylida:

```env
VITE_USE_MOCK=true    # false (standart) — haqiqiy API
```

Har bir feature'dagi `api.ts` oddiy REST endpoint'larni chaqiradi (`GET /products`, `PATCH /orders/:no` …).
`apps/api` aynan shu shartnomani amalga oshiradi, mock esa uni brauzerda taqlid qiladi (`src/mocks/handlers/*`).
Mock kodi `VITE_USE_MOCK=false` bo'lganda umuman yuklanmaydi (dinamik import).

## Papka strukturasi

```
src/
├── app/                    # ilovani yig'ish: router, provider'lar, QueryClient
│   ├── providers/
│   ├── router.tsx          # lazy sahifalar (har biri alohida chunk)
│   └── RouteError.tsx
├── layouts/AdminLayout/    # sidebar (desktop) / drawer (mobil) + topbar
├── features/               # domen bo'yicha modullar
│   └── <feature>/
│       ├── api.ts          # faqat HTTP chaqiruvlar va turlar
│       ├── queries.ts      # query key factory + useQuery/useMutation hook'lar
│       ├── schema.ts       # zod validatsiya (kerak bo'lsa)
│       ├── components/     # shu feature'ga xos komponentlar
│       └── pages/          # route sahifalari
│   (auth, dashboard, products, orders, customers, categories, coupons, settings)
├── shared/                 # domen'dan mustaqil, qayta ishlatiladigan qism
│   ├── api/                # http klient (dedup, abort, auth), ApiError
│   ├── ui/                 # Button, Field, Modal, DataTable, Pagination, Toast …
│   ├── hooks/              # useDebounce, useListParams, useMediaQuery …
│   ├── lib/                # format, phone, productArt (do'kondagi SVG), storage
│   ├── config/             # env, konstantalar (holatlar, label'lar)
│   └── types/              # domen turlari — @mc/shared dan qayta eksport
├── mocks/                  # mock backend: db, seed, REST handler'lar, router
└── styles/                 # dizayn tokenlari (do'kon sayti bilan bir xil) va base
```

Qoida: `shared` hech qachon `features`'dan import qilmaydi; feature'lar bir-biridan faqat
`queries`/`components` orqali foydalanadi.

## Takroriy so'rovlarning oldini olish

| Qatlam | Nima qiladi |
| --- | --- |
| React Query dedup | Bir xil `queryKey` — bitta so'rov (masalan sidebar badge'i va buyurtmalar tablari `useOrderStatusCounts` ni birga ishlatadi) |
| `staleTime: 30s` (toifa/sozlamalar 5 daqiqa) | Sahifalar orasida o'tganda ma'lumot qayta so'ralmaydi |
| `refetchOnWindowFocus: false` | Tab almashtirganda so'rov "yomg'iri" yo'q |
| `shared/api/http.ts` in-flight dedup | Turli joydan kelgan **aynan bir xil GET** bitta tarmoq so'roviga birlashadi; abort faqat barcha obunachilar bekor qilganda |
| `AbortSignal` | Filtr tez o'zgarsa eski so'rov bekor qilinadi |
| `useDebounce` (400ms) | Qidiruvda har harf uchun emas, yozish to'xtagandan keyin 1 so'rov |
| `keepPreviousData` | Sahifalashda eski ro'yxat ko'rinib turadi, pagination o'chiriladi |
| Mutation guard | `loading` tugma `disabled`, submit'da `isPending` tekshiruvi — 2 marta bosish = 1 so'rov |
| Optimistik yangilanish | Switch/holat darhol o'zgaradi, xatoda orqaga qaytadi |
| Cache seeding | Ro'yxatdagi mahsulot tahrirlash sahifasiga keshdan beriladi — qo'shimcha GET yo'q |
| `retry` | 4xx da qayta urinilmaydi, faqat tarmoq/5xx da |

DevTools konsolida har bir mock so'rov `[mock #N] GET /products` ko'rinishida chiqadi — tekshirish oson.
React Query Devtools faqat development rejimida yuklanadi.

## Responsivlik

- ≥ 1024px — doimiy sidebar; < 1024px — topbar + chiqib keluvchi drawer.
- `DataTable` ≤ 768px da har qatorni kartaga aylantiradi (bitta markup, CSS orqali).
- Modal mobil ekranda pastdan chiquvchi "bottom sheet".
- Mahsulot formasida mobil'da "Saqlash" tugmasi pastda yopishib turadi.
- 320px dan 1600px+ gacha gorizontal scroll yo'q.

## Do'kon sayti bilan bog'liqlik

- Mahsulotlar, toifalar va `SHOP` sozlamalari do'kon HTML'idagi ma'lumotlardan olingan.
- Buyurtma holatlari: do'kondagi `status: 0..3` → `new | processing | shipping | delivered` (+ `cancelled`).
- Mahsulot rasmi do'kondagi `art()` SVG generatoridan (`shared/lib/productArt.ts`) — admin'da ham xuddi saytdagidek ko'rinadi.
