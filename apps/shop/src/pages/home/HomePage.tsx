import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { FamilyBanner } from '@/widgets/FamilyBanner';
import { Hero } from './sections/Hero';
import { Marquee } from './sections/Marquee';
import { CategoryRings } from './sections/CategoryRings';
import { ProductsSection } from './sections/ProductsSection';
import { PromoBanner } from './sections/PromoBanner';
import { RoutineSteps } from './sections/RoutineSteps';
import { Ingredients } from './sections/Ingredients';
import { TrustBar } from './sections/TrustBar';
import { Newsletter } from './sections/Newsletter';
import './HomePage.css';

export default function HomePage() {
  useDocumentTitle('Koreys kosmetikasi');
  return (
    <>
      <Hero />
      <Marquee />
      <CategoryRings />
      <ProductsSection
        title="Eng sevimli mahsulotlar"
        subtitle="Xaridorlar ko'p tanlaydigan parvarish vositalari."
        filters={{ sort: 'pop', limit: 8 }}
        action={{ label: "Hammasini ko'rish", to: '/shop' }}
      />
      <PromoBanner />
      <RoutineSteps />
      <ProductsSection title="Yangi kelganlar" filters={{ tag: 'Yangi', limit: 4 }} action={{ label: 'Barchasi', to: '/shop?sort=new' }} />
      <section className="s flush-top">
        <div className="wrap">
          <FamilyBanner
            title="Original koreys kosmetikasi — teringizga mos tanlov"
            text="Har bir mahsulotni tarkibi va sifatiga qarab tanlaymiz. Teri turingizni ayting — sizga mos parvarish tartibini birgalikda tuzamiz."
            action={{ label: "Biz haqimizda o'qing", to: '/about' }}
          />
        </div>
      </section>
      <Ingredients />
      <TrustBar />
      <Newsletter />
    </>
  );
}
