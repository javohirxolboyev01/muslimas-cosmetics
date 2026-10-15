import { and, asc, desc, eq } from 'drizzle-orm';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { productIdFromParam, productPath, type ShopSettings } from '@mc/shared';
import { db } from '../db/client';
import { categories, products } from '../db/schema';
import { env, isProd } from '../env';
import { getSettings, DEFAULT_SETTINGS } from '../services/settings';

/**
 * Qidiruv tizimlari va ijtimoiy tarmoqlar uchun (JS ishlatmasdan ham ko'rinadigan) ma'lumotlar.
 * - GET /api/seo/head?url=/product/12 — sahifa <head> teglari; Caddy uni index.html ga qo'yadi (deploy/Caddyfile)
 * - GET /api/seo/sitemap.xml, /api/seo/robots.txt — Caddy /sitemap.xml va /robots.txt ni shu yerga uzatadi
 */

const KEYWORDS =
  "koreys kosmetikasi, koreya kosmetikasi, koreys kosmetika Toshkent, original kosmetika, teri parvarishi, " +
  "serum, krem, toner, quyoshdan himoya krem, niqob, makiyaj, kosmetika do'koni, kosmetika onlayn, корейская косметика Ташкент";

/** Indekslanmaydigan sahifalar (shaxsiy yoki foydasiz) */
const PRIVATE = /^\/(cart|checkout|wishlist|orders?)(\/|$)/;

const STATIC_PAGES: Record<string, { title: string; description: string }> = {
  '/about': {
    title: 'Biz haqimizda',
    description: "Muslima's Cosmetics — Koreyadan to'g'ridan-to'g'ri keltirilgan original kosmetika. Biz haqimizda batafsil.",
  },
  '/contact': {
    title: 'Aloqa',
    description: "Muslima's Cosmetics bilan bog'laning: telefon, Telegram va Instagram. Mahsulot tanlashda bepul maslahat beramiz.",
  },
  '/delivery': {
    title: "Yetkazib berish va to'lov",
    description: "O'zbekiston bo'ylab yetkazib berish: Toshkent bo'ylab kuryer, viloyatlarga pochta. Narxlar, muddatlar va to'lov usullari.",
  },
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** <script type="application/ld+json"> ichida "</script>" bo'lib qolmasin */
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const clip = (s: string, n = 160) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

function siteOrigin(req: FastifyRequest) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/+$/, '');
  return `${isProd ? 'https' : req.protocol}://${req.host}`;
}

interface Head {
  title: string;
  description: string;
  /** null — canonical yo'q (indekslanmaydigan sahifa) */
  canonical: string | null;
  robots: string;
  image: string;
  type: 'website' | 'product';
  extra: string[];
}

async function buildHead(rawUrl: string, origin: string, s: ShopSettings): Promise<Head> {
  const url = new URL(rawUrl, origin);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const brand = s.name;
  const head: Head = {
    title: `${brand} — koreys kosmetikasi onlayn do'koni ${s.city}da`,
    description:
      `${brand} — Koreyadan original kosmetika: serum, krem, toner, quyoshdan himoya va makiyaj vositalari. ` +
      `${s.city} bo'ylab tez yetkazib berish, viloyatlarga pochta orqali.`,
    canonical: origin + path,
    robots: 'index, follow, max-image-preview:large',
    image: `${origin}/og-image.png`,
    type: 'website',
    extra: [],
  };
  const page = (title: string) => `${title} — ${brand}`;

  if (path === '/') {
    head.canonical = `${origin}/`;
    head.extra.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'OnlineStore',
            '@id': `${origin}/#store`,
            name: brand,
            url: `${origin}/`,
            logo: `${origin}/icon-512.png`,
            image: `${origin}/og-image.png`,
            description: head.description,
            telephone: s.phone,
            address: { '@type': 'PostalAddress', addressLocality: s.city, addressCountry: 'UZ' },
            areaServed: { '@type': 'Country', name: "O'zbekiston" },
            currenciesAccepted: 'UZS',
            sameAs: [s.ig && `https://instagram.com/${s.ig}`, s.tg && `https://t.me/${s.tg}`].filter(Boolean),
          },
          {
            '@type': 'WebSite',
            '@id': `${origin}/#website`,
            name: brand,
            url: `${origin}/`,
            inLanguage: 'uz',
            publisher: { '@id': `${origin}/#store` },
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${origin}/shop?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
        ],
      }),
    );
    return head;
  }

  if (path === '/shop') {
    const cat = url.searchParams.get('cat');
    const q = url.searchParams.get('q');
    const [c] = cat ? await db.select().from(categories).where(eq(categories.id, cat)) : [];
    if (c) {
      head.title = page(`${c.name} — koreys kosmetikasi`);
      head.description = `${c.name}: Koreyadan original mahsulotlar, narxlari va tavsifi. ${brand} — ${s.city} bo'ylab tez yetkazib berish.`;
      head.canonical = `${origin}/shop?cat=${encodeURIComponent(c.id)}`;
    } else {
      head.title = page('Katalog — barcha koreys kosmetikasi');
      head.description = `Koreys kosmetikasi katalogi: serum, krem, toner, niqob, quyoshdan himoya va makiyaj. Narxlar va original mahsulotlar — ${brand}.`;
      head.canonical = `${origin}/shop`;
    }
    // Qidiruv va filtr natijalari — dublikat sahifalar; havolalar bo'ylab yurilsin, lekin indekslanmasin
    const filtered = [...url.searchParams.keys()].some((k) => k !== 'cat');
    if (q || filtered) head.robots = 'noindex, follow';
    return head;
  }

  if (path.startsWith('/product/')) {
    const id = productIdFromParam(path.slice('/product/'.length));
    const [row] = Number.isInteger(id)
      ? await db
          .select({ p: products, catName: categories.name })
          .from(products)
          .innerJoin(categories, eq(categories.id, products.categoryId))
          .where(and(eq(products.id, id), eq(products.isActive, true)))
      : [];
    if (!row) return { ...head, title: page('Sahifa topilmadi'), canonical: null, robots: 'noindex, follow' };

    const { p, catName } = row;
    const canonical = origin + productPath(p);
    const price = p.variants[0]?.price ?? 0;
    const image = p.image ? `${origin}/api/uploads/${encodeURIComponent(p.image)}` : head.image;
    head.title = page(p.name);
    head.description = clip(`${p.name} — ${p.description}`) || head.description;
    head.canonical = canonical;
    head.image = image;
    head.type = 'product';
    head.extra.push(
      `<meta property="product:price:amount" content="${price}" />`,
      '<meta property="product:price:currency" content="UZS" />',
      `<meta property="product:availability" content="${p.stock > 0 ? 'in stock' : 'out of stock'}" />`,
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${canonical}#product`,
        name: p.name,
        description: clip(p.description, 5000),
        image: [image],
        sku: String(p.id),
        category: catName,
        url: canonical,
        offers: p.variants.map((v) => ({
          '@type': 'Offer',
          name: v.label,
          price: v.price,
          priceCurrency: 'UZS',
          availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: canonical,
          seller: { '@type': 'Organization', name: brand },
        })),
      }),
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Bosh sahifa', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: catName, item: `${origin}/shop?cat=${encodeURIComponent(p.categoryId)}` },
          { '@type': 'ListItem', position: 3, name: p.name, item: canonical },
        ],
      }),
    );
    return head;
  }

  const info = STATIC_PAGES[path];
  if (info) return { ...head, title: page(info.title), description: info.description };

  if (PRIVATE.test(path)) return { ...head, title: brand, canonical: null, robots: 'noindex, nofollow' };
  return { ...head, title: page('Sahifa topilmadi'), canonical: null, robots: 'noindex, follow' };
}

function renderHead(h: Head, s: ShopSettings) {
  const t = esc(h.title);
  const d = esc(h.description);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta name="keywords" content="${esc(KEYWORDS)}" />`,
    `<meta name="robots" content="${h.robots}" />`,
    h.canonical && `<link rel="canonical" href="${esc(h.canonical)}" />`,
    `<meta property="og:site_name" content="${esc(s.name)}" />`,
    '<meta property="og:locale" content="uz_UZ" />',
    `<meta property="og:type" content="${h.type}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    h.canonical && `<meta property="og:url" content="${esc(h.canonical)}" />`,
    `<meta property="og:image" content="${esc(h.image)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<meta name="twitter:image" content="${esc(h.image)}" />`,
    ...h.extra,
  ]
    .filter(Boolean)
    .join('\n    ');
}

export const seoRoutes: FastifyPluginAsync = async (app) => {
  app.get('/head', async (req, reply) => {
    const { url = '/' } = req.query as { url?: string };
    const origin = siteOrigin(req);
    reply.type('text/html; charset=utf-8').header('cache-control', 'no-store');
    // Bu javob sahifaning o'ziga qo'shiladi — xato bo'lsa ham sayt ochilaversin (standart teglar bilan)
    let s = DEFAULT_SETTINGS;
    try {
      s = await getSettings(db);
      return renderHead(await buildHead(url.startsWith('/') ? url : '/', origin, s), s);
    } catch (err) {
      req.log.error(err);
      return renderHead({ ...(await buildHead('/', origin, s)), canonical: null, extra: [] }, s);
    }
  });

  app.get('/robots.txt', async (req, reply) => {
    const origin = siteOrigin(req);
    reply.type('text/plain; charset=utf-8').header('cache-control', 'public, max-age=3600');
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /cart',
      'Disallow: /checkout',
      'Disallow: /wishlist',
      'Disallow: /orders',
      'Disallow: /order/',
      'Disallow: /api/',
      'Allow: /api/uploads/',
      '',
      `Host: ${new URL(origin).host}`,
      `Sitemap: ${origin}/sitemap.xml`,
      '',
    ].join('\n');
  });

  app.get('/sitemap.xml', async (req, reply) => {
    const origin = siteOrigin(req);
    const [cats, prods] = await Promise.all([
      db.select({ id: categories.id }).from(categories).orderBy(asc(categories.createdAt)),
      db
        .select({ id: products.id, name: products.name, image: products.image })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(desc(products.popularity), asc(products.id)),
    ]);
    const url = (loc: string, priority: string, freq: string, extra = '') =>
      `<url><loc>${esc(origin + loc)}</loc><changefreq>${freq}</changefreq><priority>${priority}</priority>${extra}</url>`;
    const body = [
      url('/', '1.0', 'daily'),
      url('/shop', '0.9', 'daily'),
      ...cats.map((c) => url(`/shop?cat=${encodeURIComponent(c.id)}`, '0.8', 'daily')),
      ...prods.map((p) =>
        url(
          productPath(p),
          '0.8',
          'weekly',
          p.image
            ? `<image:image><image:loc>${esc(`${origin}/api/uploads/${encodeURIComponent(p.image)}`)}</image:loc><image:title>${esc(p.name)}</image:title></image:image>`
            : '',
        ),
      ),
      url('/delivery', '0.5', 'monthly'),
      url('/about', '0.4', 'monthly'),
      url('/contact', '0.4', 'monthly'),
    ];
    reply.type('application/xml; charset=utf-8').header('cache-control', 'public, max-age=3600');
    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
      body.join('\n') +
      '\n</urlset>\n'
    );
  });
};
