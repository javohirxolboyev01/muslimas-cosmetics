import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button, InfoCard, InfoCardGrid, PageHeader, type IconName } from '@/shared/ui';
import { FamilyBanner } from '@/widgets/FamilyBanner';
import './InfoPages.css';

const VALUES: { e: IconName; t: string; d: string }[] = [
  { e: 'heart', t: "Shaxsiy e'tibor", d: "Har bir buyurtmani e'tibor bilan qadoqlaymiz va savollaringizga shaxsan javob beramiz." },
  { e: 'shieldCheck', t: 'Ishonchli tanlov', d: "Mahsulotlarni tanlashda tarkibi va teri turiga mosligiga e'tibor beramiz." },
  { e: 'smile', t: 'Halol munosabat', d: 'Aniq narx, ochiq yetkazib berish shartlari va tushunarli maslahat.' },
];

export default function AboutPage() {
  useDocumentTitle('Biz haqimizda');
  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Biz haqimizda' }]} title="Biz haqimizda" />
      <FamilyBanner
        className="about-banner"
        title="Muslima's Cosmetics — koreys kosmetikasi do'koni"
        text="Biz Koreya kosmetikasini sevamiz va uni sizga yaqinlashtiramiz. Maqsadimiz — sizga ishonchli, original va teringizga mos mahsulotlarni qulay narxda yetkazish."
        action={{ label: "Katalogni ko'rish", to: '/shop' }}
      />
      <InfoCardGrid>
        {VALUES.map((v) => (
          <InfoCard key={v.t} icon={v.e} title={v.t}><p>{v.d}</p></InfoCard>
        ))}
      </InfoCardGrid>
      <section className="s">
        <div className="prose">
          <h2>Qanday ishlaymiz?</h2>
          <p>Katalogdan mahsulot tanlaysiz, savatga qo'shasiz va buyurtma berasiz. Biz siz bilan Telegram yoki telefon orqali bog'lanib, buyurtmani tasdiqlaymiz va yetkazib beramiz.</p>
          <p>Teri turingizga qaysi vosita mosligini bilmasangiz — bizga yozing, birgalikda tanlaymiz.</p>
          <div className="cta-row">
            <Button to="/contact">Bog'lanish</Button>
            <Button to="/delivery" variant="soft">Yetkazib berish shartlari</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
