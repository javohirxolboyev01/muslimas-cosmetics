import { Link } from 'react-router-dom';
import { useShop } from '@/config/shop';
import { telLink } from '@/shared/lib/messenger';
import { Logo } from '@/shared/ui';
import './Footer.css';

const COLUMNS = [
  { title: "Do'kon", links: [['Katalog', '/shop'], ['Aksiyalar', '/shop?sale=1'], ['Sevimlilar', '/wishlist'], ['Savat', '/cart']] },
  { title: "Ma'lumot", links: [['Biz haqimizda', '/about'], ['Yetkazib berish', '/delivery'], ['Buyurtmalarim', '/orders'], ['Aloqa', '/contact']] },
];

export function Footer() {
  const SHOP = useShop();
  return (
    <footer className="site">
      <div className="wrap">
        <div className="f-grid">
          <div>
            <Logo variant="footer" />
            <p>Oilaviy onlayn do'kon: Koreyaning teri parvarishi va makiyaj vositalari.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(([l, to]) => (
                  <li key={to}><Link to={to}>{l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4>Aloqa</h4>
            <ul>
              <li><a href={telLink(SHOP.phone)}>{SHOP.phone}</a></li>
              <li><a href={`https://t.me/${SHOP.tg}`} target="_blank" rel="noopener noreferrer">Telegram</a></li>
              <li><a href={`https://instagram.com/${SHOP.ig}`} target="_blank" rel="noopener noreferrer">Instagram</a></li>
              <li>{SHOP.hours}</li>
            </ul>
          </div>
        </div>
        <div className="f-bottom">
          <span>© {new Date().getFullYear()} {SHOP.name}. Barcha huquqlar himoyalangan.</span>
          <span>{SHOP.city}, O'zbekiston</span>
        </div>
      </div>
    </footer>
  );
}
