const ITEMS = [
  { e: '🛡️', t: 'Original mahsulot', d: 'Ishonchli yetkazib beruvchilardan' },
  { e: '🚚', t: 'Tez yetkazish', d: "Butun O'zbekiston bo'ylab" },
  { e: '🎁', t: 'Ehtiyotkor qadoq', d: "Sovg'a uchun ham mos" },
  { e: '💬', t: 'Maslahat', d: 'Teri turingizga mos tanlov' },
];

export function TrustBar() {
  return (
    <section className="s flush-top">
      <div className="wrap">
        <div className="trust">
          {ITEMS.map((i) => (
            <div key={i.t}>
              <span className="e" aria-hidden="true">{i.e}</span>
              <p><b>{i.t}</b><span className="t">{i.d}</span></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
