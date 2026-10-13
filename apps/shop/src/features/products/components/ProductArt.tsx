import { memo, useId } from 'react';
import type { ArtShape } from '../model/types';

interface Props {
  shape: ArtShape;
  c1: string;
  c2: string;
  className?: string;
}

const GOLD = '#f2c98a';

const Highlight = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <rect x={x} y={y} width="6" height={h} rx="3" fill="#fff" opacity=".4" />
);

const Label = ({ x, y, w, h, col }: { x: number; y: number; w: number; h: number; col: string }) => (
  <>
    <rect x={x} y={y} width={w} height={h} rx="7" fill="#fff" opacity=".88" />
    <rect x={x + 6} y={y + 8} width={w - 12} height="3.5" rx="1.7" fill={col} />
    <rect x={x + 6} y={y + 16} width={(w - 12) * 0.65} height="3.5" rx="1.7" fill={col} opacity=".5" />
    <circle cx={x + w / 2} cy={y + h - 9} r="3" fill={col} opacity=".7" />
  </>
);

/** Mahsulot rasmi o'rniga chiziladigan SVG qadoq. Haqiqiy rasm kelganda <img> bilan almashtiriladi. */
export const ProductArt = memo(function ProductArt({ shape, c1, c2, className }: Props) {
  const id = 'g' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const grad = `url(#${id})`;

  let body: React.ReactNode = null;
  switch (shape) {
    case 'serum':
      body = (
        <>
          <rect x="51" y="6" width="18" height="24" rx="8" fill="#fff" />
          <rect x="45" y="28" width="30" height="11" rx="3" fill={GOLD} />
          <rect x="33" y="38" width="54" height="88" rx="15" fill={grad} />
          <Highlight x={39} y={48} h={70} />
          <Label x={42} y={66} w={36} h={38} col={c2} />
        </>
      );
      break;
    case 'bottle':
      body = (
        <>
          <rect x="53" y="4" width="14" height="10" rx="3" fill={GOLD} />
          <rect x="42" y="12" width="28" height="6" rx="3" fill={GOLD} />
          <rect x="49" y="18" width="22" height="14" rx="3" fill="#fff" opacity=".9" />
          <rect x="34" y="30" width="52" height="96" rx="17" fill={grad} />
          <Highlight x={40} y={40} h={76} />
          <Label x={42} y={62} w={36} h={40} col={c2} />
        </>
      );
      break;
    case 'jar':
      body = (
        <>
          <rect x="22" y="50" width="76" height="22" rx="9" fill={GOLD} />
          <rect x="18" y="70" width="84" height="56" rx="20" fill={grad} />
          <Highlight x={26} y={78} h={38} />
          <ellipse cx="60" cy="98" rx="22" ry="13" fill="#fff" opacity=".85" />
          <rect x="46" y="94" width="28" height="3.5" rx="1.7" fill={c2} />
          <rect x="51" y="101" width="18" height="3.5" rx="1.7" fill={c2} opacity=".5" />
        </>
      );
      break;
    case 'tube':
    case 'sun':
      body = (
        <>
          <rect x="44" y="104" width="32" height="22" rx="6" fill="#fff" />
          <path d="M36 106L84 106L88 26Q60 18 32 26Z" fill={grad} />
          <rect x="32" y="14" width="56" height="12" rx="3" fill={c2} />
          {[38, 44, 50, 56, 62, 68, 74, 80].map((x) => (
            <rect key={x} x={x} y="14" width="1.5" height="12" fill="#fff" opacity=".35" />
          ))}
          <path d="M41 34l1.6 66" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".35" />
          {shape === 'sun' ? (
            <>
              <circle cx="60" cy="68" r="14" fill="#fff" opacity=".9" />
              <circle cx="60" cy="68" r="8" fill="#ffc83d" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <rect key={a} x="59" y="48" width="2.2" height="5" rx="1" fill="#ffc83d" transform={`rotate(${a} 60 68)`} />
              ))}
            </>
          ) : (
            <Label x={44} y={50} w={32} h={40} col={c2} />
          )}
        </>
      );
      break;
    case 'mask':
      body = (
        <>
          <rect x="24" y="14" width="72" height="112" rx="9" fill={grad} />
          <rect x="24" y="14" width="72" height="9" rx="4" fill="#fff" opacity=".4" />
          <ellipse cx="60" cy="68" rx="20" ry="26" fill="#fff" opacity=".9" />
          <ellipse cx="52" cy="62" rx="3.5" ry="2.2" fill={c2} />
          <ellipse cx="68" cy="62" rx="3.5" ry="2.2" fill={c2} />
          <path d="M53 78q7 6 14 0" stroke={c2} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="38" y="104" width="44" height="4" rx="2" fill="#fff" opacity=".8" />
        </>
      );
      break;
    case 'lip':
      body = (
        <>
          <path d="M49 52L49 30Q60 12 71 30L71 52Z" fill={c2} />
          <path d="M52 24Q60 14 68 24" stroke="#fff" strokeWidth="2.5" fill="none" opacity=".5" strokeLinecap="round" />
          <rect x="45" y="50" width="30" height="14" rx="3" fill={GOLD} />
          <rect x="42" y="62" width="36" height="64" rx="8" fill={grad} />
          <Highlight x={47} y={70} h={46} />
          <rect x="48" y="96" width="24" height="3.5" rx="1.7" fill="#fff" opacity=".85" />
        </>
      );
      break;
    case 'cushion':
      body = (
        <>
          <circle cx="60" cy="74" r="46" fill={grad} />
          <circle cx="60" cy="74" r="38" fill="#fff" opacity=".28" />
          <circle cx="60" cy="74" r="29" fill="#fff" opacity=".7" />
          <path d="M60 62c3 5 6 7 11 8-5 1-8 3-11 8-3-5-6-7-11-8 5-1 8-3 11-8z" fill={c2} />
          <path d="M30 52Q36 38 50 33" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".5" />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy={shape === 'cushion' ? 126 : 131} rx={shape === 'cushion' ? 36 : 34} ry="5" fill="#3a2840" opacity=".1" />
      {body}
    </svg>
  );
});
