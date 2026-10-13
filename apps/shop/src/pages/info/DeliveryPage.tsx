import { useShop } from '@/config/shop';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatPrice } from '@/shared/lib/format';
import { Accordion, PageHeader, Panel } from '@/shared/ui';
import './InfoPages.css';

const FAQ: [string, string][] = [
  ['Buyurtmani qanday beraman?', "Mahsulotni savatga qo'shing, «Buyurtmani rasmiylashtirish»ni bosing va ma'lumotlaringizni kiriting. Buyurtma darhol bizga yetib keladi — tasdiqlash uchun siz bilan bog'lanamiz."],
  ["Qaysi to'lov usullari bor?", "Yetkazilganda naqd pul yoki kartaga o'tkazma. O'tkazma rekvizitlari buyurtma tasdiqlangach yuboriladi."],
  ['Buyurtmani qancha vaqtda olaman?', 'Toshkent shahrida odatda 1–2 kun, viloyatlarga manzilga qarab 2–5 kun.'],
  ['Teri turimga mosini qanday tanlayman?', "Katalogda «Teri turi» filtrini ishlating yoki bizga yozing — maslahat beramiz."],
  ['Mahsulotni qaytarish mumkinmi?', "Gigiena sababli ochilgan kosmetika qaytarilmaydi. Nuqsonli yoki noto'g'ri mahsulot kelsa, 24 soat ichida bizga xabar bering."],
];

export default function DeliveryPage() {
  useDocumentTitle("Yetkazib berish va to'lov");
  const SHOP = useShop();
  const rows = [
    ['Toshkent shahri — kuryer', '1–2 kun', `${formatPrice(SHOP.shipCourier)} (${formatPrice(SHOP.freeFrom)} dan yuqorida bepul)`],
    ['Viloyatlarga', '2–5 kun', formatPrice(SHOP.shipPost)],
    ["O'zim olib ketaman", 'Kelishilgan vaqtda', 'Bepul'],
  ];
  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Yetkazib berish' }]} title="Yetkazib berish va to'lov" />
      <Panel className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Usul</th><th>Muddat</th><th>Narx</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>{r.map((c, i) => <td key={i} data-label={['Usul', 'Muddat', 'Narx'][i]}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <h2 className="faq-title">Ko'p so'raladigan savollar</h2>
      <Accordion className="faq" items={FAQ.map(([q, a]) => ({ title: q, content: a }))} />
    </div>
  );
}
