# Muslima's Cosmetics

Koreys kosmetikasi onlayn do'koni: mijozlar uchun sayt, admin panel va ular ishlatadigan umumiy backend.

```
my-cosmetecs/
├── apps/
│   ├── shop/      # Mijozlar sayti — React 19, Vite, TanStack Query, Zustand        → :5173
│   ├── admin/     # Admin panel — React 19, Vite, TanStack Query, RHF + Zod         → :5174
│   └── api/       # Backend — Fastify 5, PostgreSQL, Drizzle ORM, JWT               → :8080
└── packages/
    └── shared/    # Umumiy turlar, konstantalar, narx hisobi, Zod sxemalari (@mc/shared)
```

npm workspaces ishlatiladi: `npm install` faqat ildiz papkada bajariladi.

## Ishga tushirish (lokal)

Kerak: **Node.js 22+** va **PostgreSQL 14+**.

```bash
npm install

# 1. Baza va sozlamalar
createdb muslima_cosmetics
cp apps/api/.env.example apps/api/.env      # JWT_SECRET ni almashtiring: openssl rand -hex 32
cp apps/shop/.env.example apps/shop/.env
cp apps/admin/.env.example apps/admin/.env

# 2. Jadvallar va boshlang'ich ma'lumotlar
npm run db:migrate
npm run db:seed                              # toifalar, 18 mahsulot, promokodlar, admin
npm run db:seed:demo -w @mc/api              # (ixtiyoriy) + 64 ta demo buyurtma — dashboard to'lishi uchun

# 3. Hammasini birga ishga tushirish
npm run dev
```

- Sayt: http://localhost:5173
- Admin: http://localhost:5174 — `admin@muslima.uz` / `admin123` (`.env` dagi `ADMIN_*`)
- API: http://localhost:8080/api/health

Dev rejimida Vite `/api` so'rovlarini `localhost:8080` ga proxy qiladi, shuning uchun CORS kerak emas.

## Buyruqlar

| Buyruq | Nima qiladi |
| --- | --- |
| `npm run dev` | API + sayt + admin birga |
| `npm run dev:api` / `dev:shop` / `dev:admin` | Alohida |
| `npm run typecheck` | Barcha workspace'larda TypeScript tekshiruvi |
| `npm test` | Shared unit testlar + API integratsion testlari (`muslima_cosmetics_test` bazasi kerak: `createdb muslima_cosmetics_test`) |
| `npm run build` | Sayt, admin va API production build |
| `npm run db:migrate` | Migratsiyalarni qo'llash |
| `npm run db:generate -w @mc/api` | `schema.ts` o'zgargach yangi migratsiya yaratish |

## Qanday ishlaydi

### Buyurtma oqimi
1. Mijoz savatni to'ldiradi; savat brauzerda (Zustand + localStorage) saqlanadi.
2. Checkout'da sayt serverga **faqat** `{ productId, variant, qty }` ro'yxati, mijoz ma'lumotlari va promokodni yuboradi.
3. API bitta tranzaksiyada:
   - mahsulotlarni `FOR UPDATE` bilan qulflaydi, faolligini va qoldig'ini tekshiradi;
   - promokodni tekshirib, `usageCount` ni oshiradi;
   - narx, chegirma va yetkazish narxini **o'zi** hisoblaydi (`@mc/shared` → `orderTotals`; sayt oldindan ko'rsatish uchun xuddi shu funksiyadan foydalanadi);
   - qoldiqni kamaytiradi va tasodifiy `MC-123456` raqam bilan buyurtma yaratadi.
4. `TELEGRAM_BOT_TOKEN` va `TELEGRAM_CHAT_ID` berilgan bo'lsa, do'kon egasiga Telegram xabari boradi.
5. Mijoz buyurtma holatini sayt orqali kuzatadi. Buning uchun buyurtma raqami va telefon raqami kerak, shuning uchun begona buyurtmani ko'rib bo'lmaydi.
6. Admin holatni o'zgartiradi: `new → processing → shipping → delivered`, istalgan bosqichda `cancelled`. Bekor qilingan buyurtmaning mahsulotlari omborga qaytadi.

### Do'kon sozlamalari
Telefon, Telegram, ish vaqti, yetkazish narxlari va reklama qilinadigan promokod admin paneldagi **Sozlamalar** sahifasidan boshqariladi. Sayt ularni `GET /api/public/settings` orqali oladi.

### API
| Prefiks | Kim uchun | Himoya |
| --- | --- | --- |
| `/api/public/*` | Sayt: katalog, sozlamalar, promokod tekshiruvi, buyurtma berish va kuzatish | Ochiq. Buyurtma berish va login'da rate limit bor |
| `/api/auth/*` | Admin login (`POST /login`), `GET /me` | — |
| `/api/{dashboard,products,categories,orders,customers,coupons,settings}` | Admin panel | `Authorization: Bearer <JWT>` |

Xatolar har doim `{ message, errors?: { maydon: xabar } }` ko'rinishida qaytadi: 401, 404, 409 (konflikt yoki qoldiq yetmasligi) va 422 (validatsiya).

### Admin panelning mock rejimi
`apps/admin/.env` da `VITE_USE_MOCK=true` qo'yilsa, admin backendsiz ishlaydi. Ma'lumotlar brauzerning localStorage'idagi soxta REST server'da saqlanadi. Bu dizayn ustida ishlash uchun qulay.

## Production'ga chiqarish

Tavsiya qilinadigan sxema: **API + PostgreSQL** bitta serverda yoki PaaS'da (Railway, Render, VPS), **sayt va admin** esa statik hostingda (Vercel, Netlify, Cloudflare Pages yoki nginx).

### API
```bash
npm ci
npm run build -w @mc/api
# muhit o'zgaruvchilari: apps/api/.env.example ga qarang
NODE_ENV=production npm run migrate:prod -w @mc/api
NODE_ENV=production ADMIN_EMAIL=... ADMIN_PASSWORD='<kuchli parol>' npm run seed:prod -w @mc/api
NODE_ENV=production npm start -w @mc/api
```
Majburiy sozlamalar:
- `JWT_SECRET`: kamida 32 belgi, tasodifiy.
- `DATABASE_URL`.
- `CORS_ORIGINS`: sayt va admin domenlari, vergul bilan ajratilgan. Masalan: `https://muslima.uz,https://admin.muslima.uz`.
- `UPLOAD_DIR`: mahsulot rasmlari saqlanadigan papka (standart: `apps/api/uploads`). Doimiy (persistent) diskda bo'lishi va zaxira nusxaga kirishi kerak, aks holda qayta deploy'da rasmlar yo'qoladi.

API reverse proxy (nginx, Caddy) ortida HTTPS bilan ishlashi kerak. `trustProxy` yoqilgan, shuning uchun rate limit mijozning haqiqiy IP'si bo'yicha ishlaydi.

### Sayt va admin
```bash
VITE_API_URL=https://api.muslima.uz/api npm run build -w @mc/shop    # → apps/shop/dist
VITE_API_URL=https://api.muslima.uz/api npm run build -w @mc/admin   # → apps/admin/dist
```
Ikkalasi ham SPA. Hostingda barcha yo'llar `index.html` ga qaytishi kerak (Netlify: `/* /index.html 200`, Vercel: rewrites, nginx: `try_files $uri /index.html`).

Agar sayt, admin va API bitta domenda bo'lsa (masalan, nginx `/api` ni API'ga proxy qilsa), `VITE_API_URL=/api` qoldiriladi va CORS kerak bo'lmaydi.

### Railway (har bir qism alohida servis)
Har bir ilovada `Dockerfile` va `railway.json` bor. Build konteksti repo ildizi bo'ladi, chunki `@mc/shared` kerak. Railway'da 4 ta servis ochiladi: **Postgres**, **api**, **shop**, **admin**. Ilova servislari bitta GitHub repodan yaratiladi va **Settings → Config-as-code** da o'z faylini ko'rsatadi: `/apps/api/railway.json`, `/apps/shop/railway.json`, `/apps/admin/railway.json`. Root Directory bo'sh qoladi.

Sayt va admin Caddy'da ishlaydi. Caddy `/api/*` so'rovlarini Railway ichki tarmog'i orqali `api.railway.internal:8080` ga uzatadi. Shuning uchun brauzer uchun hammasi bitta domenda bo'ladi: `VITE_API_URL` va `CORS_ORIGINS` kerak emas. Faqat backend servisining nomi aynan `api` bo'lishi shart.

api servisi o'zgaruvchilari: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `PORT=8080`, `JWT_SECRET`, `UPLOAD_DIR=/data/uploads` (Volume `/data` ga ulanadi), `ADMIN_EMAIL`, `ADMIN_PASSWORD`, birinchi deploy uchun `SEED_ON_START=true`. Domen (Generate Domain) faqat shop va admin uchun kerak.

Admin login'i `ADMIN_EMAIL` va `ADMIN_PASSWORD` dan olinadi: ularni almashtirib Deploy qilinsa, yangi email/parol o'rnatiladi, eski admin o'chiriladi va ochiq sessiyalar yopiladi.

API har deploy'da migratsiyalarni o'zi qo'llaydi. Seed (toifalar, demo mahsulotlar, admin) faqat `SEED_ON_START=true` bo'lganda ishlaydi. Birinchi muvaffaqiyatli deploy'dan keyin bu o'zgaruvchini olib tashlang, aks holda mahsulotlar jadvali bo'shab qolsa demo mahsulotlar qaytadan qo'shiladi.

### Ishga tushirishdan oldin
- [ ] `ADMIN_PASSWORD` kuchli parolga almashtirilgan, demo `admin123` ishlatilmayapti
- [ ] `JWT_SECRET` yangi va tasodifiy
- [ ] Admin → Sozlamalar: haqiqiy telefon, WhatsApp, Telegram va Instagram kiritilgan
- [ ] Telegram bot ulangan (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) va test buyurtma xabari kelgan
- [ ] PostgreSQL'ning kunlik zaxira nusxasi (backup) sozlangan
