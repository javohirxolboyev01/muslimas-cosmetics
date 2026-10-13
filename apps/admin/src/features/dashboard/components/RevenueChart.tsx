import { memo, useMemo, useState } from 'react';
import { useElementWidth } from '@/shared/hooks/useElementWidth';
import { formatCompact, formatDayShort, formatMoney } from '@/shared/lib/format';
import type { DashboardData } from '../api';
import styles from './RevenueChart.module.css';

const HEIGHT = 240;
const PAD = { top: 12, right: 8, bottom: 28, left: 56 };

/** Yuqori burchaklari 4px yumaloq, pastki qismi bazaviy chiziqqa tekis ustun */
const barPath = (x: number, y: number, w: number, h: number) => {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

/** "Chiroyli" maksimal qiymat: 1, 2, 2.5, 5 × 10^n */
const niceMax = (v: number) => {
  if (v <= 0) return 100_000;
  const pow = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 2.5, 5, 10].find((m) => m * pow >= v) ?? 10) * pow;
};

export const RevenueChart = memo(function RevenueChart({ series }: { series: DashboardData['series'] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const innerW = Math.max(0, width - PAD.left - PAD.right);
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const max = niceMax(Math.max(...series.map((d) => d.revenue)));
    const band = series.length ? innerW / series.length : 0;
    const gap = Math.max(2, band * 0.3);
    const barW = Math.max(2, band - gap);
    const labelEvery = Math.ceil(series.length / Math.max(1, Math.floor(innerW / 64)));
    return {
      innerH, band, barW, max, labelEvery,
      ticks: [0, 0.25, 0.5, 0.75, 1].map((t) => ({ value: max * t, y: PAD.top + innerH * (1 - t) })),
      y: (v: number) => PAD.top + innerH * (1 - v / max),
    };
  }, [series, width]);

  const hovered = hover !== null ? series[hover] : null;

  return (
    <div ref={ref} className={styles.wrap}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label="Kunlik tushum grafigi" onMouseLeave={() => setHover(null)}>
          {geo.ticks.map((t) => (
            <g key={t.value}>
              <line x1={PAD.left} x2={width - PAD.right} y1={t.y} y2={t.y} className={t.value === 0 ? styles.baseline : styles.grid} />
              <text x={PAD.left - 8} y={t.y} className={styles.axis} textAnchor="end" dominantBaseline="middle">{formatCompact(t.value)}</text>
            </g>
          ))}
          {series.map((d, i) => {
            const x = PAD.left + i * geo.band + (geo.band - geo.barW) / 2;
            const y = geo.y(d.revenue);
            const h = PAD.top + geo.innerH - y;
            return (
              <g key={d.date}>
                {h > 0 && <path d={barPath(x, y, geo.barW, h)} className={hover === i ? styles.barActive : styles.bar} />}
                {/* Ko'rinmas keng zona — ingichka ustunlarga ham kursor oson tushadi */}
                <rect x={PAD.left + i * geo.band} y={PAD.top} width={geo.band} height={geo.innerH} fill="transparent"
                  onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
                {i % geo.labelEvery === 0 && (
                  <text x={x + geo.barW / 2} y={HEIGHT - 8} className={styles.axis} textAnchor="middle">{formatDayShort(d.date)}</text>
                )}
              </g>
            );
          })}
        </svg>
      )}
      {hovered && hover !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(Math.max(PAD.left + hover * geo.band + geo.band / 2, 80), width - 80),
            top: Math.max(geo.y(hovered.revenue) - 10, 0),
          }}
        >
          <span>{formatDayShort(hovered.date)}</span>
          <strong>{formatMoney(hovered.revenue)}</strong>
          <span>{hovered.orders} ta buyurtma</span>
        </div>
      )}
      {/* Ekran o'quvchilar uchun jadval ko'rinishi */}
      <table className="sr-only">
        <caption>Kunlik tushum</caption>
        <thead><tr><th>Sana</th><th>Tushum</th><th>Buyurtmalar</th></tr></thead>
        <tbody>{series.map((d) => <tr key={d.date}><td>{formatDayShort(d.date)}</td><td>{formatMoney(d.revenue)}</td><td>{d.orders}</td></tr>)}</tbody>
      </table>
    </div>
  );
});
