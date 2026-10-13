const WORDS = ['Centella', 'Guruch suvi', 'Hyaluron', 'Propolis', 'Niacinamide', 'Salyangoz mutsini', 'Kollagen', 'Ceramide'];

export function Marquee({ words = WORDS }: { words?: string[] }) {
  const run = [...words, ...words];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="track">
        {run.map((w, i) => <span key={i}>{w}</span>)}
      </div>
    </div>
  );
}
