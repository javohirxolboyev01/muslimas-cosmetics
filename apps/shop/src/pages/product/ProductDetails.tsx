import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAX_QTY, useShop } from '@/config/shop';
import { usageSteps } from '@/config/usage';
import { useAddToCart } from '@/features/cart';
import { ProductArt, useCategoryName, type Product } from '@/features/products';
import { WishButton } from '@/features/wishlist';
import { SKIN_LABELS } from '@mc/shared';
import { copyText } from '@/shared/lib/clipboard';
import { discountPercent, formatPrice } from '@/shared/lib/format';
import { toast } from '@/shared/toast/toastStore';
import { Accordion, Button, Chip, ChipGroup, QtyStepper } from '@/shared/ui';
import { Link } from 'react-router-dom';

const PERKS = [['🛡️', 'Original'], ['🚚', 'Tez yetkazish'], ['🎁', "Sovg'a qadoq"]];

export function ProductDetails({ product: p }: { product: Product }) {
  const navigate = useNavigate();
  const add = useAddToCart();
  const catName = useCategoryName();
  const SHOP = useShop();
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const vr = p.variants[vi];
  const off = discountPercent(vr.price, vr.oldPrice);
  const shareUrl = `${window.location.origin}/product/${p.id}`;

  const changeQty = (d: number) => setQty((q) => Math.max(1, Math.min(MAX_QTY, q + d)));
  const buyNow = () => {
    add(p.id, vi, qty, { silent: true });
    navigate('/checkout');
  };
  const share = async () => toast((await copyText(shareUrl)) ? 'Havola nusxalandi' : "Havolani nusxalab bo'lmadi");

  return (
    <div className="pd">
      <div className="gal">
        <div className="big" style={{ background: `linear-gradient(170deg,${p.bg},#fff)` }}>
          {p.tag && <span className="tag">{p.tag}</span>}
          <ProductArt shape={p.shape} c1={p.color1} c2={p.color2} />
        </div>
        <div className="perks">
          {PERKS.map(([e, t]) => <div key={t}><i aria-hidden="true">{e}</i>{t}</div>)}
        </div>
      </div>

      <div className="pd-info">
        <div className="kicker">{catName(p.categoryId)}</div>
        <h1>{p.name}</h1>
        <div className="pd-price">
          <b>{formatPrice(vr.price)}</b>
          {vr.oldPrice && <s>{formatPrice(vr.oldPrice)}</s>}
          {off > 0 && <span className="save">−{off}%</span>}
        </div>
        <p className="pd-desc">{p.description}</p>

        <div className="opt-t">{p.variants.length > 1 ? (p.categoryId === 'makiyaj' ? 'Rang / ton' : 'Hajm') : 'Hajm'}</div>
        <ChipGroup role="radiogroup" aria-label="Variant">
          {p.variants.map((v, i) => (
            <Chip key={v.label} active={i === vi} role="radio" aria-checked={i === vi} onClick={() => setVi(i)}>
              {v.label}
            </Chip>
          ))}
        </ChipGroup>

        {p.skin.length > 0 && (
          <>
            <div className="opt-t">Qaysi teri uchun</div>
            <div className="skins">{p.skin.map((k) => <span key={k}>{SKIN_LABELS[k]}</span>)}</div>
          </>
        )}

        <div className="buyrow">
          {p.inStock ? (
            <>
              <QtyStepper value={qty} onChange={changeQty} />
              <Button onClick={() => add(p.id, vi, qty)}>Savatga qo'shish</Button>
              <Button variant="navy" onClick={buyNow}>Hozir sotib olish</Button>
            </>
          ) : (
            <Button disabled>Vaqtincha tugagan</Button>
          )}
          <WishButton productId={p.id} bordered />
        </div>

        <div className="share">
          <button type="button" onClick={share}>🔗 Havolani nusxalash</button>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer">
            ✈️ Telegramda ulashish
          </a>
        </div>

        <Accordion
          className="pd-acc"
          items={[
            { title: 'Tavsif', content: p.description, defaultOpen: true },
            { title: 'Tarkib', content: `${p.ingredients}. To'liq tarkib mahsulot qadog'ida ko'rsatilgan.` },
            { title: "Qo'llash usuli", content: <ol>{usageSteps(p.categoryId).map((s) => <li key={s}>{s}</li>)}</ol> },
            {
              title: "Yetkazib berish va to'lov",
              content: (
                <>
                  Toshkent shahri bo'ylab kuryer: {formatPrice(SHOP.shipCourier)} ({formatPrice(SHOP.freeFrom)} dan yuqori buyurtmada bepul).
                  Viloyatlarga: {formatPrice(SHOP.shipPost)}. To'lov: yetkazilganda naqd yoki kartaga o'tkazma.{' '}
                  <Link to="/delivery">Batafsil</Link>
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
