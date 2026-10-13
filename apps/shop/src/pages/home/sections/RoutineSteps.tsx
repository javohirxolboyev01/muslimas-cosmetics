import { SectionHeader } from '@/shared/ui';

const STEPS = [
  { ico: '🫧', t: 'Tozalash', d: "Ko'pikli tozalagich yoki mitsellyar suv bilan kosmetika va kir ketadi." },
  { ico: '🌸', t: 'Toner', d: 'Terini keyingi vositalarga tayyorlaydi va namlik beradi.' },
  { ico: '✨', t: 'Serum va krem', d: "Maqsadli faol moddalar va namlik to'sig'i — teri yumshoq bo'ladi." },
  { ico: '☀️', t: 'SPF himoya', d: 'Ertalabki oxirgi qadam: har kuni quyoshdan himoya qiling.' },
];

export function RoutineSteps() {
  return (
    <section className="s flush-top">
      <div className="wrap">
        <SectionHeader title="Kunlik parvarish — 4 oddiy bosqich" subtitle="Koreyscha parvarish murakkab emas. Mana, asosiy tartib." />
        <ol className="stepsr">
          {STEPS.map((s) => (
            <li className="stepr" key={s.t}>
              <div className="ico" aria-hidden="true">{s.ico}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
