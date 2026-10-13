import { useShop } from '@/config/shop';
import { ProductArt } from '@/features/products';
import { copyText } from '@/shared/lib/clipboard';
import { toast } from '@/shared/toast/toastStore';

export function PromoBanner() {
  const { welcomeCoupon: code, welcomePercent } = useShop();
  if (!code || !welcomePercent) return null;
  const copy = async () => toast((await copyText(code)) ? 'Promokod nusxalandi' : `Promokod: ${code}`);
  return (
    <section className="s flush-top">
      <div className="wrap">
        <div className="promo">
          <div>
            <h2>Birinchi buyurtmangizga −{welcomePercent}% chegirma</h2>
            <p>Promokodni savat sahifasida kiriting — chegirma avtomatik hisoblanadi.</p>
            <div className="code">
              <span>{code}</span>
              <button type="button" onClick={copy}>Nusxalash</button>
            </div>
          </div>
          <div className="art" aria-hidden="true">
            <ProductArt shape="mask" c1="#ffd1e0" c2="#ff9fc0" />
            <ProductArt shape="cushion" c1="#ffe0b8" c2="#ffb88a" />
            <ProductArt shape="lip" c1="#ff7fa9" c2="#e63e7a" />
          </div>
        </div>
      </div>
    </section>
  );
}
