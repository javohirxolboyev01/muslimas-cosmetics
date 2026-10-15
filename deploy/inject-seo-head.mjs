// Build'dan keyin: index.html'dagi standart SEO blokini Caddy shabloniga almashtiradi.
// Caddy har so'rovda /api/seo/head?url=<sahifa> ni chaqirib, javobni shu joyga qo'yadi —
// qidiruv tizimlari va Telegram/Instagram ko'rinishi har sahifaning o'z sarlavhasi va rasmini ko'radi.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const file = process.argv[2];
const html = readFileSync(file, 'utf8');
const tpl = '{{httpInclude (printf "/api/seo/head?url=%s" (urlquery .OriginalReq.URL.RequestURI))}}';
const out = html.replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, tpl);
if (out === html) {
  console.error(`seo:start/seo:end bloki ${file} ichida topilmadi`);
  process.exit(1);
}
writeFileSync(file, out);
// API ishlamay qolsa Caddy shuni beradi (standart teglar bilan) — sayt ochilaversin
writeFileSync(join(dirname(file), 'index.fallback.html'), html);
