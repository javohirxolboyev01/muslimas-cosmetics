import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MAX_QTY, useShop } from '@/config/shop';
import { usageSteps } from '@/config/usage';
import { useAddToCart } from '@/features/cart';
import { ProductVisual, useCategoryName, type Product } from '@/features/products';
import { WishButton } from '@/features/wishlist';
import { SKIN_LABELS, productPath } from '@mc/shared';
import { copyText } from '@/shared/lib/clipboard';
import { discountPercent, formatPrice } from '@/shared/lib/format';
import { toast } from '@/shared/toast/toastStore';
import { Accordion, Button, Chip, ChipGroup, Icon, QtyStepper, type IconName } from '@/shared/ui';
import { Link } from 'react-router-dom';

const PERKS: [IconName, string][] = [['shieldCheck', 'Original'], ['truck', 'Tez yetkazish'], ['gift', "Sovg'a qadoq"]];

export function ProductDetails({ product: p }: { product: Product }) {
  const navigate = useNavigate();
  const add = useAddToCart();
  const catName = useCategoryName();
  const SHOP = useShop();
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const vr = p.variants[vi];
  const off = discountPercent(vr.price, vr.oldPrice);
  const shareUrl = window.location.origin + productPath(p);

  const changeQty = (d: number) => setQty((q) => Math.max(1, Math.min(MAX_QTY, q + d)));
  const buyNow = () => {
    add(p.id, vi, qty, { silent: true });
    navigate('/checkout');
  };
  const share = async () => {
    const ok = await copyText(shareUrl);
    toast(ok ? 'Havola nusxalandi' : "Havolani nusxalab bo'lmadi");
    setCopied(ok);
  };
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="pd">
      <div className="gal">
        <div className={p.image ? 'big has-img' : 'big'} style={{ background: `linear-gradient(170deg,${p.bg},#fff)` }}>
          {p.tag && <span className="tag">{p.tag}</span>}
          <ProductVisual product={p} eager />
        </div>
        <div className="perks">
          {PERKS.map(([e, t]) => <div key={t}><Icon name={e} />{t}</div>)}
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
          <button type="button" className={copied ? 'share-btn done' : 'share-btn'} onClick={share}>
            <Icon name={copied ? 'check' : 'link'} />
            {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
          </button>
          <a
            className="share-btn tg"
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(p.name)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="telegram" />
            Telegramda ulashish
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
