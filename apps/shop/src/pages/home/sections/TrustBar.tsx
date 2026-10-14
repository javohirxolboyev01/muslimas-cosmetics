import { IconTile, type IconName } from '@/shared/ui';

const ITEMS: { e: IconName; t: string; d: string }[] = [
  { e: 'shieldCheck', t: 'Original mahsulot', d: 'Ishonchli yetkazib beruvchilardan' },
  { e: 'truck', t: 'Tez yetkazish', d: "Butun O'zbekiston bo'ylab" },
  { e: 'gift', t: 'Ehtiyotkor qadoq', d: "Sovg'a uchun ham mos" },
  { e: 'message', t: 'Maslahat', d: 'Teri turingizga mos tanlov' },
];

export function TrustBar() {
  return (
    <section className="s flush-top">
      <div className="wrap">
        <div className="trust">
          {ITEMS.map((i) => (
            <div key={i.t}>
              <IconTile name={i.e} className="e" />
              <p><b>{i.t}</b><span className="t">{i.d}</span></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
