import type { Category, Product, ProductShape, SkinType } from '@/shared/types';

export const seedCategories: Category[] = [
  { id: 'tozalash', name: 'Tozalash', emoji: '🫧', bg: '#dcf6e9' },
  { id: 'toner', name: 'Toner va essensiya', emoji: '💦', bg: '#e3f1ff' },
  { id: 'serum', name: 'Serum', emoji: '✨', bg: '#ece3ff' },
  { id: 'krem', name: 'Krem', emoji: '🤍', bg: '#fff2c6' },
  { id: 'niqob', name: 'Niqob', emoji: '🧖‍♀️', bg: '#ffe3d4' },
  { id: 'quyosh', name: 'Quyoshdan himoya', emoji: '☀️', bg: '#fff2c6' },
  { id: 'makiyaj', name: 'Makiyaj', emoji: '💄', bg: '#ffd6e4' },
];

/* Do'kon HTML faylidagi RAW massiv bilan bir xil format:
   [id, nom, toifa, shakl, rang1, rang2, fon, belgi, teri, variantlar, tavsif, tarkib, mashhurlik, qoldiq] */
type Raw = [number, string, string, ProductShape, string, string, string, string, string, string, string, string, number, number];

const RAW: Raw[] = [
  [1, 'Centella tinchlantiruvchi serum', 'serum', 'serum', '#b9e8cf', '#6fcf9f', '#e4f8ee', 'Hit', 'sezgir,aralash,yogli', '30 ml:189000|50 ml:269000', "Yengil, yopishqoq bo'lmagan serum. Terini tinchlantirib, kun davomida tiniq ko'rinish berishga yordam beradi.", 'Centella asiatica ekstrakti, panthenol, glycerin, allantoin', 98, 24],
  [2, 'Guruch suvi yorituvchi toner', 'toner', 'bottle', '#ffe1ea', '#ffb3cd', '#fff0f5', '', 'normal,quruq,aralash', '200 ml:149000|300 ml:199000', 'Yumshoq toner: terini tozalagandan keyin namlantiradi va keyingi vositalarga tayyorlaydi.', 'Guruch ekstrakti, niacinamide, glycerin, betaine', 90, 18],
  [3, 'Hyaluron namlovchi krem', 'krem', 'jar', '#cbb8ff', '#9d82f2', '#f1ebff', '−15%', 'quruq,normal,sezgir', '50 ml:219000:259000', 'Yengil tuzilishli krem. Teriga uzoq vaqt namlik berib, yumshoq va elastik his qildiradi.', 'Sodium hyaluronate, ceramide NP, squalane, panthenol', 88, 3],
  [4, "Yumshoq ko'pikli yuz tozalagich", 'tozalash', 'tube', '#bfe3ff', '#7cc0f5', '#e9f5ff', '', 'normal,aralash,sezgir', '150 ml:99000', "Zich ko'pik beradi, terini tortishtirmasdan yumshoq tozalaydi.", "Amino-kislotali sirt-faol moddalar, glycerin, chamomile ekstrakti", 80, 31],
  [5, 'Niacinamide 10% yorituvchi serum', 'serum', 'serum', '#ffd9a8', '#ffab6e', '#fff1e0', 'Yangi', 'yogli,aralash,normal', '30 ml:175000', "Teri tusini tekislashga va g'ovaklar ko'rinishini yengillashtirishga yordam beradi.", 'Niacinamide 10%, zinc PCA, hyaluronic acid', 92, 12],
  [6, 'Quyoshdan himoya gel SPF50+', 'quyosh', 'sun', '#ffe48a', '#ffbf3d', '#fff8d9', 'Hit', 'normal,aralash,yogli,sezgir', '50 ml:159000', 'Yengil gel tekstura, oq iz qoldirmaydi va makiyaj ostiga mos.', 'UV filtrlar, centella, hyaluronic acid', 95, 40],
  [7, 'Salyangoz mutsini essensiyasi', 'toner', 'bottle', '#e6d9ff', '#b79cf5', '#f3edff', '−17%', 'quruq,normal,sezgir', '100 ml:239000:289000', "Terini namlantiruvchi essensiya: toner va serum o'rtasidagi qadam.", 'Snail secretion filtrate, betaine, panthenol', 85, 9],
  [8, 'Kollagen gidrogel niqob', 'niqob', 'mask', '#ffc9dc', '#ff90b6', '#ffeef4', 'Yangi', 'quruq,normal,aralash', '5 dona:129000|10 dona:239000', 'Yuzga zich yopishadigan gidrogel niqob. 15–20 daqiqada namlik va yumshoqlik beradi.', 'Hydrolyzed collagen, glycerin, hyaluronic acid', 84, 22],
  [9, 'Yorqin lab tinti', 'makiyaj', 'lip', '#ff7fa9', '#e63e7a', '#ffe3ed', '', '', 'Atirgul:89000|Marjon:89000|Olcha:89000', 'Yengil, yorqin rang beruvchi tint. Lablarni quritmaydi.', 'Mevali moylar, vitamin E, glycerin', 91, 2],
  [10, 'Cushion tonal krem SPF40', 'makiyaj', 'cushion', '#ffe0b8', '#ffb88a', '#fff0e0', '', 'normal,quruq,aralash', '21 Yengil:199000|23 Tabiiy:199000', 'Tabiiy yoritish effektli tonal vosita, spons bilan oson suriladi.', 'SPF filtrlar, niacinamide, hyaluronic acid', 86, 14],
  [11, 'Propolis tungi niqob', 'niqob', 'jar', '#ffe08f', '#ffb83d', '#fff6d6', '', 'quruq,normal,sezgir', '60 ml:169000', "Kechasi surtiladigan niqob: ertalab teri yumshoq va tiniq ko'rinadi.", 'Propolis ekstrakti, honey, ceramide', 78, 0],
  [12, 'Yumshoq mitsellyar suv', 'tozalash', 'bottle', '#d5f5e6', '#8fdcb8', '#e6f9f0', '', 'sezgir,normal,quruq', '300 ml:119000|500 ml:169000', 'Makiyaj va kirni yumshoq ketkazadi, ishqalamasdan ishlatiladi.', 'Micellar kompleks, glycerin, allantoin', 82, 27],
  [13, "Ko'z atrofi uchun krem", 'krem', 'jar', '#ffd6e0', '#ff9fb8', '#fff0f4', 'Yangi', 'normal,quruq,aralash', '30 ml:179000', "Ko'z atrofi nozik terisi uchun boy, lekin og'ir bo'lmagan krem.", 'Peptidlar, caffeine, shea butter', 76, 11],
  [14, 'Lab balzami', 'makiyaj', 'lip', '#ffd0b8', '#ff9a76', '#fff1e8', '', '', 'Shaftoli:59000|Asal:59000', 'Lablarni yumshatuvchi va namlantiruvchi balzam.', 'Shea butter, jojoba oil, vitamin E', 79, 35],
  [15, 'Peeling gel', 'tozalash', 'tube', '#e0d4ff', '#a98cf5', '#f4eeff', '', 'normal,aralash,yogli', '120 ml:109000', 'Yumshoq peeling: terining yuzasini ohista tozalaydi. Haftada 1–2 marta.', 'Cellulose, glycerin, fruit acids', 72, 16],
  [16, 'Vitamin C yorituvchi serum', 'serum', 'serum', '#ffe3a3', '#ffbd45', '#fff7dc', '', 'normal,aralash,quruq', '30 ml:199000|50 ml:289000', "Terini yoritishga va bir tekis ko'rinish berishga yordam beruvchi serum.", 'Ascorbic acid derivativlari, vitamin E, ferulic acid', 87, 5],
  [17, 'Barer tiklovchi krem', 'krem', 'jar', '#c9ecff', '#7fc8f2', '#eaf7ff', '', 'sezgir,quruq,normal', '50 ml:229000', "Terining himoya qatlamini qo'llab-quvvatlovchi boy krem, sovuq mavsum uchun ayniqsa mos.", 'Ceramides, cholesterol, panthenol, madecassoside', 83, 19],
  [18, 'Quyoshdan himoya stik SPF50', 'quyosh', 'tube', '#ffeaa8', '#ffc84d', '#fff9e0', 'Yangi', 'normal,aralash,yogli', "18 g:139000", "Qulay stik shakli: makiyaj ustidan ham, yo'lda ham yangilash oson.", 'UV filtrlar, vitamin E, jojoba oil', 81, 21],
];

const DAY = 86_400_000;

export const seedProducts = (now: number): Product[] =>
  RAW.map(([id, name, categoryId, shape, color1, color2, bg, tag, skin, vars, description, ingredients, popularity, stock]) => ({
    id,
    name,
    categoryId,
    shape,
    color1,
    color2,
    bg,
    tag,
    skin: (skin ? skin.split(',') : []) as SkinType[],
    variants: vars.split('|').map((v) => {
      const [label, price, oldPrice] = v.split(':');
      return { label, price: Number(price), ...(oldPrice ? { oldPrice: Number(oldPrice) } : {}) };
    }),
    description,
    ingredients,
    popularity,
    stock,
    isActive: true,
    createdAt: new Date(now - (RAW.length - id) * 4 * DAY).toISOString(),
  }));
