import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { CreateOrderInput, Order } from '@mc/shared';
import { buildApp } from '../src/app';
import { db, sqlClient } from '../src/db/client';
import { admins, categories, coupons, products } from '../src/db/schema';
import { syncAdmin } from '../src/services/admin';
import { DEFAULT_SETTINGS, saveSettings } from '../src/services/settings';

let app: FastifyInstance;
let token = '';

const product = (id: number, over: Partial<typeof products.$inferInsert> = {}): typeof products.$inferInsert => ({
  id, name: `Mahsulot ${id}`, categoryId: 'serum', shape: 'serum', color1: '#ffffff', color2: '#000000', bg: '#eeeeee',
  tag: '', skin: ['quruq'], variants: [{ label: '30 ml', price: 100_000 }, { label: '50 ml', price: 150_000 }],
  description: 'Uzun tavsif matni', ingredients: 'Suv, glycerin', popularity: 50, stock: 5, isActive: true, ...over,
});

const orderInput = (over: Partial<CreateOrderInput> = {}): CreateOrderInput => ({
  name: 'Test Mijoz', phone: '+998 90 111 22 33', region: 'Toshkent shahri', city: 'Yunusobod', addr: "Amir Temur ko'chasi 1",
  note: '', delivery: 'courier', pay: 'cash', coupon: '', items: [{ productId: 1, variant: 0, qty: 1 }], ...over,
});

const auth = () => ({ authorization: `Bearer ${token}` });

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await app.close();
  await sqlClient.end();
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE orders, products, categories, coupons, settings, admins RESTART IDENTITY CASCADE`);
  await db.insert(categories).values([{ id: 'serum', name: 'Serum', emoji: '✨', bg: '#eeeeee' }]);
  await db.insert(products).values([product(1), product(2, { stock: 1 }), product(3, { isActive: false })]);
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('products', 'id'), 3)`);
  await db.insert(coupons).values([
    { code: 'GLOW15', percent: 15, isActive: true },
    { code: 'OFF10', percent: 10, isActive: false },
  ]);
  await saveSettings(db, DEFAULT_SETTINGS);
  await db.insert(admins).values({ email: 'admin@test.uz', name: 'Admin', passwordHash: bcrypt.hashSync('secret123', 4) });
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'admin@test.uz', password: 'secret123' } });
  token = res.json().token;
});

describe('auth', () => {
  it("noto'g'ri parol — 401", async () => {
    const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: { email: 'admin@test.uz', password: 'nope' } });
    expect(res.statusCode).toBe(401);
  });
  it('admin API tokensiz yopiq', async () => {
    expect((await app.inject({ url: '/api/products' })).statusCode).toBe(401);
    expect((await app.inject({ url: '/api/products', headers: { authorization: 'Bearer junk' } })).statusCode).toBe(401);
    expect((await app.inject({ url: '/api/products', headers: auth() })).statusCode).toBe(200);
  });
  it('/auth/me foydalanuvchini qaytaradi', async () => {
    const res = await app.inject({ url: '/api/auth/me', headers: auth() });
    expect(res.json()).toMatchObject({ email: 'admin@test.uz', name: 'Admin' });
  });
});

describe('admin login sozlamasi', () => {
  it('email/parol almashsa eski admin o‘chadi va eski sessiya yaroqsiz bo‘ladi', async () => {
    const before = auth();
    expect(await syncAdmin('ADMIN@test.uz', 'secret123', 'Admin')).toBe('unchanged');
    // parol o'zgarmagan — sessiya saqlanadi
    expect((await app.inject({ url: '/api/auth/me', headers: before })).statusCode).toBe(200);

    expect(await syncAdmin('boss@test.uz', 'yangiParol99')).toBe('created');
    expect((await app.inject({ url: '/api/auth/me', headers: before })).statusCode).toBe(401);
    const login = (email: string, password: string) =>
      app.inject({ method: 'POST', url: '/api/auth/login', payload: { email, password } });
    expect((await login('admin@test.uz', 'secret123')).statusCode).toBe(401);
    const ok = await login('boss@test.uz', 'yangiParol99');
    expect(ok.statusCode).toBe(200);

    expect(await syncAdmin('boss@test.uz', 'boshqaParol1')).toBe('updated');
    const me = await app.inject({ url: '/api/auth/me', headers: { authorization: `Bearer ${ok.json().token}` } });
    expect(me.statusCode).toBe(401);
  });
});

describe('ochiq katalog', () => {
  it('faol bo‘lmagan mahsulot ko‘rinmaydi, qoldiq soni oshkor qilinmaydi', async () => {
    const list = (await app.inject({ url: '/api/public/products' })).json();
    expect(list.map((p: { id: number }) => p.id).sort()).toEqual([1, 2]);
    expect(list[0]).not.toHaveProperty('stock');
    expect(list[0]).toHaveProperty('inStock', true);
    expect((await app.inject({ url: '/api/public/products/3' })).statusCode).toBe(404);
  });
  it('toifalarda faqat faol mahsulotlar sanaladi', async () => {
    const [cat] = (await app.inject({ url: '/api/public/categories' })).json();
    expect(cat).toMatchObject({ id: 'serum', count: 2 });
  });
  it('sozlamalarda faol welcome promokod foizi bor', async () => {
    const s = (await app.inject({ url: '/api/public/settings' })).json();
    expect(s).toMatchObject({ welcomeCoupon: 'GLOW15', welcomePercent: 15 });
  });
});

describe('buyurtma berish', () => {
  it('narxni serverda hisoblaydi va qoldiqni kamaytiradi', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/public/orders',
      payload: { ...orderInput({ coupon: 'glow15', items: [{ productId: 1, variant: 1, qty: 2 }] }), total: 1, sub: 1 },
    });
    expect(res.statusCode).toBe(201);
    const o: Order = res.json();
    // 2 × 150 000 = 300 000; −15% = 45 000; kuryer 25 000 (chegaradan past)
    expect(o).toMatchObject({ sub: 300_000, disc: 45_000, ship: 25_000, total: 280_000, coupon: 'GLOW15', status: 'new' });
    expect(o.items[0]).toMatchObject({ productId: 1, variantLabel: '50 ml', price: 150_000, qty: 2 });
    expect(o.no).toMatch(/^MC-\d{6}$/);
    expect(o).not.toHaveProperty('adminNote');

    const p = (await app.inject({ url: '/api/products/1', headers: auth() })).json();
    expect(p.stock).toBe(3);
    const list: { code: string; usageCount: number }[] = (await app.inject({ url: '/api/coupons', headers: auth() })).json();
    expect(list.find((c) => c.code === 'GLOW15')?.usageCount).toBe(1);
  });

  it('qoldiqdan ko‘p — 409, hech narsa o‘zgarmaydi', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput({ items: [{ productId: 2, variant: 0, qty: 2 }] }) });
    expect(res.statusCode).toBe(409);
    const p = (await app.inject({ url: '/api/products/2', headers: auth() })).json();
    expect(p.stock).toBe(1);
  });

  it('bir vaqtdagi ikki buyurtma oxirgi donani ikki marta sotmaydi', async () => {
    const send = () => app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput({ items: [{ productId: 2, variant: 0, qty: 1 }] }) });
    const codes = (await Promise.all([send(), send()])).map((r) => r.statusCode).sort();
    expect(codes).toEqual([201, 409]);
  });

  it('nofaol mahsulot, noto‘g‘ri variant, nofaol promokod va kuryer cheklovi', async () => {
    const post = (payload: CreateOrderInput) => app.inject({ method: 'POST', url: '/api/public/orders', payload });
    expect((await post(orderInput({ items: [{ productId: 3, variant: 0, qty: 1 }] }))).statusCode).toBe(409);
    expect((await post(orderInput({ items: [{ productId: 1, variant: 9, qty: 1 }] }))).statusCode).toBe(409);
    expect((await post(orderInput({ coupon: 'OFF10' }))).statusCode).toBe(422);
    const courier = await post(orderInput({ region: 'Andijon' }));
    expect(courier.statusCode).toBe(422);
    expect(courier.json().errors).toHaveProperty('delivery');
  });

  it('validatsiya xatolari maydonlar bo‘yicha qaytadi', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/public/orders', payload: { name: 'A', phone: '90', items: [] } });
    expect(res.statusCode).toBe(422);
    expect(Object.keys(res.json().errors)).toEqual(expect.arrayContaining(['name', 'phone', 'items', 'delivery']));
  });

  it('buyurtmani faqat to‘g‘ri telefon bilan ko‘rish mumkin', async () => {
    const o: Order = (await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput() })).json();
    expect((await app.inject({ url: `/api/public/orders/${o.no}?phone=901112233` })).statusCode).toBe(200);
    expect((await app.inject({ url: `/api/public/orders/${o.no}?phone=901112234` })).statusCode).toBe(404);
    const list = (await app.inject({
      method: 'POST', url: '/api/public/orders/lookup', payload: { refs: [{ no: o.no, phone: '998901112233' }, { no: 'MC-000000', phone: '1' }] },
    })).json();
    expect(list).toHaveLength(1);
  });
});

describe('admin: buyurtma holati', () => {
  it('ruxsat etilmagan o‘tish — 409; bekor qilish qoldiqni qaytaradi', async () => {
    const o: Order = (await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput({ items: [{ productId: 1, variant: 0, qty: 2 }] }) })).json();
    const patch = (payload: object) => app.inject({ method: 'PATCH', url: `/api/orders/${o.no}`, headers: auth(), payload });

    expect((await patch({ status: 'delivered' })).statusCode).toBe(409);
    expect((await patch({ status: 'processing' })).json().status).toBe('processing');
    expect((await patch({ status: 'cancelled', adminNote: 'Mijoz rad etdi' })).json()).toMatchObject({ status: 'cancelled', adminNote: 'Mijoz rad etdi' });
    expect((await patch({ status: 'new' })).statusCode).toBe(409);

    const p = (await app.inject({ url: '/api/products/1', headers: auth() })).json();
    expect(p.stock).toBe(5);

    const counts = (await app.inject({ url: '/api/orders/status-counts', headers: auth() })).json();
    expect(counts).toEqual({ cancelled: 1 });
  });
});

describe('admin: CRUD', () => {
  it('mahsulot yaratish/yangilash/o‘chirish va toifani himoyalash', async () => {
    const input = { ...product(0), id: undefined, popularity: undefined };
    delete input.id;
    delete input.popularity;
    const created = await app.inject({ method: 'POST', url: '/api/products', headers: auth(), payload: { ...input, name: 'Yangi krem' } });
    expect(created.statusCode).toBe(201);
    const id = created.json().id;
    expect(id).toBeGreaterThan(3);

    const patched = await app.inject({ method: 'PATCH', url: `/api/products/${id}`, headers: auth(), payload: { isActive: false } });
    expect(patched.json().isActive).toBe(false);

    const bad = await app.inject({ method: 'PUT', url: `/api/products/${id}`, headers: auth(), payload: { ...input, categoryId: 'yoq' } });
    expect(bad.statusCode).toBe(422);

    const delCat = await app.inject({ method: 'DELETE', url: '/api/categories/serum', headers: auth() });
    expect(delCat.statusCode).toBe(409);

    // Content-Type: application/json + bo'sh body — xato bermasligi kerak
    const del = await app.inject({ method: 'DELETE', url: `/api/products/${id}`, headers: { ...auth(), 'content-type': 'application/json' } });
    expect(del.statusCode).toBe(204);
  });

  it('rasm yuklash: faqat rasm qabul qilinadi, almashtirilgan rasm o‘chadi', async () => {
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
    const upload = (payload: Buffer, type = 'image/png', headers: Record<string, string> = auth()) =>
      app.inject({ method: 'POST', url: '/api/uploads', headers: { ...headers, 'content-type': type }, payload });

    expect((await upload(png, 'image/png', {})).statusCode).toBe(401);
    expect((await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'image/png')).statusCode).toBe(415);
    expect((await upload(png, 'text/plain')).statusCode).toBe(415);

    const first = await upload(png);
    expect(first.statusCode).toBe(201);
    const a = first.json().name as string;
    expect(a).toMatch(/^[a-f0-9]{32}\.png$/);
    const file = await app.inject({ url: `/api/uploads/${a}` });
    expect(file.headers['content-type']).toBe('image/png');
    expect(file.rawPayload.equals(png)).toBe(true);
    expect((await app.inject({ url: '/api/uploads/..%2F.env' })).statusCode).toBe(404);

    const missing = await app.inject({ method: 'PATCH', url: '/api/products/1', headers: auth(), payload: { image: `${'0'.repeat(32)}.png` } });
    expect(missing.statusCode).toBe(422);
    expect((await app.inject({ method: 'PATCH', url: '/api/products/1', headers: auth(), payload: { image: '../x.png' } })).statusCode).toBe(422);

    await app.inject({ method: 'PATCH', url: '/api/products/1', headers: auth(), payload: { image: a } });
    const pub = (await app.inject({ url: '/api/public/products/1' })).json();
    expect(pub.image).toBe(a);

    const b = (await upload(png)).json().name as string;
    await app.inject({ method: 'PATCH', url: '/api/products/1', headers: auth(), payload: { image: b } });
    expect((await app.inject({ url: `/api/uploads/${a}` })).statusCode).toBe(404);
    await app.inject({ method: 'PATCH', url: '/api/products/1', headers: auth(), payload: { image: '' } });
    expect((await app.inject({ url: `/api/uploads/${b}` })).statusCode).toBe(404);
  });

  it('ro‘yxat sahifalanadi va filtrlanadi', async () => {
    const res = (await app.inject({ url: '/api/products?status=low&sort=stock_asc&pageSize=1&page=9', headers: auth() })).json();
    // qoldig'i ≤ 5: barcha 3 tasi; 9-sahifa so'ralsa oxirgi (3-) sahifa qaytadi
    expect(res).toMatchObject({ total: 3, page: 3, pageSize: 1, pageCount: 3 });
    expect(res.items[0].id).toBe(3);
  });

  it('promokod: dublikat 409, kod katta harfga o‘tadi', async () => {
    const a = await app.inject({ method: 'POST', url: '/api/coupons', headers: auth(), payload: { code: 'yoz20', percent: 20, isActive: true } });
    expect(a.json()).toMatchObject({ code: 'YOZ20', usageCount: 0 });
    const b = await app.inject({ method: 'POST', url: '/api/coupons', headers: auth(), payload: { code: 'YOZ20', percent: 20, isActive: true } });
    expect(b.statusCode).toBe(409);
  });

  it('mijozlar buyurtmalardan yig‘iladi, bekor qilinganlar summaga kirmaydi', async () => {
    await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput() });
    const o: Order = (await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput({ name: 'Yangi Ism' }) })).json();
    await app.inject({ method: 'PATCH', url: `/api/orders/${o.no}`, headers: auth(), payload: { status: 'cancelled' } });
    const res = (await app.inject({ url: '/api/customers', headers: auth() })).json();
    expect(res.total).toBe(1);
    expect(res.items[0]).toMatchObject({ name: 'Yangi Ism', ordersCount: 2, totalSpent: 125_000 });
  });

  it('dashboard hisoboti', async () => {
    await app.inject({ method: 'POST', url: '/api/public/orders', payload: orderInput() });
    const d = (await app.inject({ url: '/api/dashboard?days=7', headers: auth() })).json();
    expect(d).toMatchObject({ days: 7, orders: 1, revenue: 125_000, customers: 1 });
    expect(d.series).toHaveLength(7);
    expect(d.topProducts[0]).toMatchObject({ productId: 1, qty: 1 });
    expect(d.lowStock.map((p: { id: number }) => p.id)).toEqual([2, 1]);
  });

  it('sozlamalarni saqlash', async () => {
    const res = await app.inject({ method: 'PUT', url: '/api/settings', headers: auth(), payload: { ...DEFAULT_SETTINGS, freeFrom: 300_000, welcomeCoupon: 'off10' } });
    expect(res.json()).toMatchObject({ freeFrom: 300_000, welcomeCoupon: 'OFF10' });
    const pub = (await app.inject({ url: '/api/public/settings' })).json();
    expect(pub).toMatchObject({ freeFrom: 300_000, welcomePercent: 0 });
  });
});

describe('SEO', () => {
  const head = async (url: string) =>
    (await app.inject({ url: `/api/seo/head?url=${encodeURIComponent(url)}`, headers: { host: 'shop.uz' } })).body;

  it('mahsulot sahifasi: sarlavha, canonical (slug bilan), narx va JSON-LD', async () => {
    const html = await head('/product/1');
    expect(html).toContain('<title>Mahsulot 1 — ');
    expect(html).toContain('<link rel="canonical" href="http://shop.uz/product/1-mahsulot-1" />');
    expect(html).toContain('"@type":"Product"');
    expect(html).toContain('"price":100000');
  });

  it("faol bo'lmagan mahsulot va shaxsiy sahifalar indekslanmaydi", async () => {
    expect(await head('/product/3-mahsulot-3')).toContain('noindex');
    expect(await head('/cart')).toContain('noindex, nofollow');
    expect(await head('/shop?q=krem')).toContain('noindex');
  });

  it('matndagi HTML ekranlanadi', async () => {
    await db.update(products).set({ name: '</title><script>x</script>' }).where(sql`id = 1`);
    const html = await head('/product/1');
    expect(html).not.toContain('<script>x');
    expect(html).toContain('&lt;/title&gt;');
  });

  it("sitemap faqat faol mahsulotlarni slug bilan ko'rsatadi; robots sitemap'ga ishora qiladi", async () => {
    const xml = (await app.inject({ url: '/api/seo/sitemap.xml', headers: { host: 'shop.uz' } })).body;
    expect(xml).toContain('<loc>http://shop.uz/product/1-mahsulot-1</loc>');
    expect(xml).toContain('<loc>http://shop.uz/shop?cat=serum</loc>');
    expect(xml).not.toContain('/product/3');
    const robots = (await app.inject({ url: '/api/seo/robots.txt', headers: { host: 'shop.uz' } })).body;
    expect(robots).toContain('Sitemap: http://shop.uz/sitemap.xml');
  });
});
