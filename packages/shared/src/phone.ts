/** Faqat 9 ta mahalliy raqamni qaytaradi (998 prefiksisiz). */
export const phoneDigits = (s: string) => {
  let d = String(s).replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  return d.slice(0, 9);
};

/** "901234567" → "+998 90 123 45 67" (qisman kiritilgan raqam ham maskalanadi) */
export const formatPhone = (s: string) => {
  const d = phoneDigits(s);
  if (!d) return '';
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(' ')}`;
};

export const isValidPhone = (s: string) => phoneDigits(s).length === 9;
