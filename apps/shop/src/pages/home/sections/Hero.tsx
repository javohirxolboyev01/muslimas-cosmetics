import { ProductArt } from '@/features/products';
import { Button, Icon } from '@/shared/ui';

const POINTS = ['Original mahsulotlar', 'Sezgir teriga mos tanlov', "Butun O'zbekiston bo'ylab"];

export function Hero() {
  return (
    <div className="hero">
      <div className="wrap hero-grid">
        <div>
          <h1>Nurli teri — Seuldan to'g'ri uyingizgacha</h1>
          <p className="lead">Koreyaning original teri parvarishi va makiyaj vositalari — har bir xaridorga shaxsiy maslahat bilan.</p>
          <div className="cta-row">
            <Button to="/shop">Xarid qilishni boshlash</Button>
            <Button to="/about" variant="soft">Biz haqimizda</Button>
          </div>
          <div className="hero-points">
            {POINTS.map((p) => (
              <span key={p}><Icon name="check" />{p}</span>
            ))}
          </div>
        </div>
        <div className="stage" aria-hidden="true">
          <div className="arch" />
          <div className="prod p1"><ProductArt shape="tube" c1="#ffa6c4" c2="#ff6f9f" /></div>
          <div className="prod p2"><ProductArt shape="serum" c1="#c9b2ff" c2="#9b7bf0" /></div>
          <div className="prod p3"><ProductArt shape="jar" c1="#ffcf9e" c2="#ff9f7a" /></div>
          <div className="sticker s1"><span className="dot">🌿</span><span>Centella<b>tinchlantiradi</b></span></div>
          <div className="sticker s2"><span className="dot">💧</span><span>Hyaluron<b>24 soat namlik</b></span></div>
        </div>
      </div>
    </div>
  );
}
