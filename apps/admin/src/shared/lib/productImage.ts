import { env } from '@/shared/config/env';

/** Mahsulot rasmi manzili. Mock rejimida rasm o'zi data URL bo'ladi */
export const productImageUrl = (image: string) =>
  image.startsWith('data:image/') ? image : `${env.apiUrl}/uploads/${encodeURIComponent(image)}`;

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_SIDE = 1200;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Yuklashdan oldin rasmni kichraytiradi (eng uzun tomoni 1200px) va siqadi.
 * Telefon rasmlari 5–10 MB bo'ladi, bu esa saytni sekinlashtiradi; natija odatda 100–300 KB.
 * WEBP qo'llab-quvvatlanmasa (eski Safari) — shaffof PNG uchun PNG, qolganlari JPEG.
 */
export async function prepareProductImage(file: File): Promise<Blob> {
  if (!IMAGE_ACCEPT.split(',').includes(file.type)) throw new Error('Faqat JPG, PNG yoki WEBP rasm tanlang');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Rasm juda katta (20 MB dan oshmasin)');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Rasmni o'qib bo'lmadi. Boshqa fayl tanlang");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await toBlob(canvas, 'image/webp', 0.86);
  if (webp?.type === 'image/webp') return webp;
  const fallback = await toBlob(canvas, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
  if (!fallback) throw new Error("Rasmni tayyorlab bo'lmadi");
  return fallback;
}
