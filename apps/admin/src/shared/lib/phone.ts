export const phoneDigits = (s: string) => {
  let d = s.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  return d.slice(0, 9);
};

export const formatPhone = (s: string) => {
  const d = phoneDigits(s);
  if (!d) return '';
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(' ')}`;
};

export const telHref = (s: string) => `tel:+998${phoneDigits(s)}`;
