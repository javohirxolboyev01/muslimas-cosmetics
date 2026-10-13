import type { ProductShape } from '@/shared/types';

/**
 * Do'kon saytidagi mahsulot illyustratsiyasi (SVG) — admin panelda ham bir xil ko'rinishi uchun.
 * Ranglar faqat HEX bo'lsa qabul qilinadi, aks holda standart rang ishlatiladi (XSS himoyasi).
 */
const HEX = /^#[0-9a-f]{3,8}$/i;
const safe = (c: string, fallback: string) => (HEX.test(c) ? c : fallback);

let uid = 0;

export function productArt(shape: ProductShape, color1: string, color2: string): string {
  const id = `pa${uid++}`;
  const c1 = safe(color1, '#ffd0e1');
  const c2 = safe(color2, '#f0508a');
  const defs = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
  const hl = (x: number, y: number, h: number) =>
    `<rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="#fff" opacity=".4"/>`;
  const lab = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#fff" opacity=".88"/><rect x="${x + 6}" y="${y + 8}" width="${w - 12}" height="3.5" rx="1.7" fill="${c2}"/><rect x="${x + 6}" y="${y + 16}" width="${(w - 12) * 0.65}" height="3.5" rx="1.7" fill="${c2}" opacity=".5"/><circle cx="${x + w / 2}" cy="${y + h - 9}" r="3" fill="${c2}" opacity=".7"/>`;
  const fill = `url(#${id})`;

  let body = '';
  switch (shape) {
    case 'serum':
      body = `<rect x="51" y="6" width="18" height="24" rx="8" fill="#fff"/><rect x="45" y="28" width="30" height="11" rx="3" fill="#f2c98a"/><rect x="33" y="38" width="54" height="88" rx="15" fill="${fill}"/>${hl(39, 48, 70)}${lab(42, 66, 36, 38)}`;
      break;
    case 'bottle':
      body = `<rect x="53" y="4" width="14" height="10" rx="3" fill="#f2c98a"/><rect x="42" y="12" width="28" height="6" rx="3" fill="#f2c98a"/><rect x="49" y="18" width="22" height="14" rx="3" fill="#fff" opacity=".9"/><rect x="34" y="30" width="52" height="96" rx="17" fill="${fill}"/>${hl(40, 40, 76)}${lab(42, 62, 36, 40)}`;
      break;
    case 'jar':
      body = `<rect x="22" y="50" width="76" height="22" rx="9" fill="#f2c98a"/><rect x="18" y="70" width="84" height="56" rx="20" fill="${fill}"/>${hl(26, 78, 38)}<ellipse cx="60" cy="98" rx="22" ry="13" fill="#fff" opacity=".85"/><rect x="46" y="94" width="28" height="3.5" rx="1.7" fill="${c2}"/><rect x="51" y="101" width="18" height="3.5" rx="1.7" fill="${c2}" opacity=".5"/>`;
      break;
    case 'tube':
    case 'sun': {
      const ribs = [38, 44, 50, 56, 62, 68, 74, 80]
        .map((x) => `<rect x="${x}" y="14" width="1.5" height="12" fill="#fff" opacity=".35"/>`)
        .join('');
      const sun = `<circle cx="60" cy="68" r="14" fill="#fff" opacity=".9"/><circle cx="60" cy="68" r="8" fill="#ffc83d"/>${[0, 45, 90, 135, 180, 225, 270, 315]
        .map((a) => `<rect x="59" y="48" width="2.2" height="5" rx="1" fill="#ffc83d" transform="rotate(${a} 60 68)"/>`)
        .join('')}`;
      body = `<rect x="44" y="104" width="32" height="22" rx="6" fill="#fff"/><path d="M36 106L84 106L88 26Q60 18 32 26Z" fill="${fill}"/><rect x="32" y="14" width="56" height="12" rx="3" fill="${c2}"/>${ribs}<path d="M41 34l1.6 66" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>${shape === 'sun' ? sun : lab(44, 50, 32, 40)}`;
      break;
    }
    case 'mask':
      body = `<rect x="24" y="14" width="72" height="112" rx="9" fill="${fill}"/><rect x="24" y="14" width="72" height="9" rx="4" fill="#fff" opacity=".4"/><ellipse cx="60" cy="68" rx="20" ry="26" fill="#fff" opacity=".9"/><ellipse cx="52" cy="62" rx="3.5" ry="2.2" fill="${c2}"/><ellipse cx="68" cy="62" rx="3.5" ry="2.2" fill="${c2}"/><path d="M53 78q7 6 14 0" stroke="${c2}" stroke-width="2.5" fill="none" stroke-linecap="round"/><rect x="38" y="104" width="44" height="4" rx="2" fill="#fff" opacity=".8"/>`;
      break;
    case 'lip':
      body = `<path d="M49 52L49 30Q60 12 71 30L71 52Z" fill="${c2}"/><path d="M52 24Q60 14 68 24" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/><rect x="45" y="50" width="30" height="14" rx="3" fill="#f2c98a"/><rect x="42" y="62" width="36" height="64" rx="8" fill="${fill}"/>${hl(47, 70, 46)}<rect x="48" y="96" width="24" height="3.5" rx="1.7" fill="#fff" opacity=".85"/>`;
      break;
    case 'cushion':
      body = `<circle cx="60" cy="74" r="46" fill="${fill}"/><circle cx="60" cy="74" r="38" fill="#fff" opacity=".28"/><circle cx="60" cy="74" r="29" fill="#fff" opacity=".7"/><path d="M60 62c3 5 6 7 11 8-5 1-8 3-11 8-3-5-6-7-11-8 5-1 8-3 11-8z" fill="${c2}"/><path d="M30 52Q36 38 50 33" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".5"/>`;
      break;
  }
  const shadowY = shape === 'cushion' ? 126 : 131;
  const shadow = `<ellipse cx="60" cy="${shadowY}" rx="34" ry="5" fill="#3a2840" opacity=".1"/>`;
  return `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${shadow}${body}</svg>`;
}

export const PRODUCT_SHAPES: { value: ProductShape; label: string }[] = [
  { value: 'serum', label: 'Serum flakon' },
  { value: 'bottle', label: 'Shisha' },
  { value: 'jar', label: 'Banka' },
  { value: 'tube', label: 'Tuba' },
  { value: 'sun', label: 'SPF tuba' },
  { value: 'mask', label: 'Niqob' },
  { value: 'lip', label: 'Lab vositasi' },
  { value: 'cushion', label: 'Cushion' },
];
