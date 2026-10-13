import { SectionHeader } from '@/shared/ui';

const ITEMS = [
  { e: '🌿', t: 'Centella', d: 'Qizarish va hasaslikni tinchlantiradi', bg: 'var(--mint)' },
  { e: '🍚', t: 'Guruch suvi', d: 'Terini yoritadi va yumshatadi', bg: 'var(--pink-soft)' },
  { e: '💧', t: 'Hyaluron kislotasi', d: 'Chuqur va uzoq namlantirish', bg: 'var(--lilac)' },
  { e: '🍯', t: 'Propolis', d: "Tiniq va sog'lom ko'rinish uchun", bg: 'var(--butter)' },
  { e: '🐌', t: 'Salyangoz mutsini', d: 'Namlik va yumshoqlik beradi', bg: 'var(--peach)' },
  { e: '🧪', t: 'Niacinamide', d: 'Teri tusini tekislashga yordam beradi', bg: 'var(--sky)' },
];

export function Ingredients() {
  return (
    <section className="s flush-top">
      <div className="wrap">
        <SectionHeader title="Koreys go'zalligining sevimli tarkiblari" subtitle="Mahsulot tanlashda shu nomlarga e'tibor bering." />
        <div className="ings">
          {ITEMS.map((i) => (
            <div className="ing" key={i.t} style={{ background: i.bg }}>
              <span className="e" aria-hidden="true">{i.e}</span>
              <div><b>{i.t}</b><span>{i.d}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
