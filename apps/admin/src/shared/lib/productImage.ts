import { env } from '@/shared/config/env';

/** Mahsulot rasmi manzili. Mock rejimida rasm o'zi data URL bo'ladi */
export const productImageUrl = (image: string) =>
  image.startsWith('data:image/') ? image : `${env.apiUrl}/uploads/${encodeURIComponent(image)}`;

/**
 * 'image/*' — telefonda fayl menejeri emas, galereya (Photos) ochiladi.
 * iPhone HEIC rasmlarni tanlashda o'zi JPEG'ga aylantiradi; qolgan formatlar brauzerda qayta kodlanadi.
 */
export const IMAGE_ACCEPT = 'image/*';
const MAX_SIDE = 1200;
const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/** createImageBitmap eski iOS Safari'da (15 gacha) Blob'ni o'qiy olmaydi — unda oddiy <img> orqali o'qiladi */
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // pastdagi <img> usuliga o'tamiz
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("Rasmni o'qib bo'lmadi. Galereyadan boshqa rasm tanlang");
  }
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
}

/**
 * Yuklashdan oldin rasmni kichraytiradi (eng uzun tomoni 1200px) va siqadi.
 * Telefon rasmlari 5–10 MB bo'ladi, bu esa saytni sekinlashtiradi; natija odatda 100–300 KB.
 * WEBP qo'llab-quvvatlanmasa (Safari) — shaffof PNG uchun PNG, qolganlari JPEG.
 */
export async function prepareProductImage(file: File): Promise<Blob> {
  // Ba'zi Android galereyalari turini bo'sh beradi — unda faylni o'qib ko'ramiz
  if (file.type && !file.type.startsWith('image/')) throw new Error('Faqat rasm tanlang');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Rasm juda katta (30 MB dan oshmasin)');

  const image = await decode(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d')!.drawImage(image.source, 0, 0, canvas.width, canvas.height);
  image.close();

  const webp = await toBlob(canvas, 'image/webp', 0.86);
  if (webp?.type === 'image/webp') return webp;
  const fallback = await toBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
  if (!fallback) throw new Error("Rasmni tayyorlab bo'lmadi");
  return fallback;
}
