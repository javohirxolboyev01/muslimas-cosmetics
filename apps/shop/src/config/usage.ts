/** Toifa bo'yicha qo'llash usuli (mahsulot sahifasidagi «Qo'llash usuli» bo'limi) */
const USAGE_STEPS: Record<string, string[]> = {
  tozalash: [
    "Kafti nam bo'lsa-da, qo'lga oz miqdor oling.",
    'Yuzga aylantirib massaj qiling (30–60 soniya).',
    'Iliq suv bilan yaxshilab yuving.',
  ],
  toner: [
    "Tozalagandan so'ng paxta yoki kaftingizga oling.",
    'Yuzga yengil urib, shimdiring.',
    "Keyingi qadamga (serum/krem) o'ting.",
  ],
  serum: [
    "Tonerdan so'ng 2–3 tomchi oling.",
    "Yuz va bo'yinga yengil bosib, shimdiring.",
    'Ustidan krem surting.',
  ],
  krem: [
    "Serumdan so'ng no'xat kattaligida oling.",
    "Yuz va bo'yinga yuqoriga qarab yoying.",
    'Ertalab SPF bilan tugallang.',
  ],
  niqob: [
    'Yuzni tozalab, toner suring.',
    "Niqobni yuzga qo'ying yoki yupqa qatlam suring.",
    "Ko'rsatilgan vaqtdan so'ng oling va qoldiqni massaj qiling.",
  ],
  quyosh: [
    'Parvarishning oxirgi qadami sifatida suring.',
    "Uydan chiqishdan 15 daqiqa oldin yuz va bo'yinga yoying.",
    'Kun davomida 2–3 soatda yangilab turing.',
  ],
  makiyaj: [
    "Teriga tekis yoyib suring.",
    "Kerak bo'lsa, qatlamni oshiring.",
    'Kun oxirida makiyaj tozalagich bilan oling.',
  ],
};

const GENERIC = [
  "Toza va quruq teriga oz miqdorda oling.",
  "Yengil harakatlar bilan yoyib, shimdiring.",
  "Qadoqdagi ko'rsatmalarga amal qiling.",
];

export const usageSteps = (categoryId: string) => USAGE_STEPS[categoryId] ?? GENERIC;
