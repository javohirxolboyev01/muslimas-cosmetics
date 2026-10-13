import { randomUUID } from 'node:crypto';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PRODUCT_IMAGE_RE } from '@mc/shared';
import { env } from '../env';
import { HttpError } from './errors';

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;

const dir = resolve(process.cwd(), env.UPLOAD_DIR);

export const CONTENT_TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
type Ext = keyof typeof CONTENT_TYPES;

/** Fayl turi Content-Type sarlavhasiga emas, faylning o'z "imzosi"ga (magic bytes) qarab aniqlanadi */
function detectExt(buf: Buffer): Ext | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

export const uploadPath = (name: string) => (PRODUCT_IMAGE_RE.test(name) ? resolve(dir, name) : null);

export async function saveImage(buf: Buffer): Promise<string> {
  const ext = detectExt(buf);
  if (!ext) throw new HttpError(415, 'Faqat JPG, PNG yoki WEBP rasm yuklash mumkin');
  const name = `${randomUUID().replaceAll('-', '')}.${ext}`;
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, name), buf);
  return name;
}

export async function assertImageExists(name: string) {
  const path = uploadPath(name);
  const ok = path && (await access(path).then(() => true, () => false));
  if (!ok) throw new HttpError(422, 'Rasm topilmadi, qayta yuklang', { image: 'Rasm topilmadi, qayta yuklang' });
}

/** Eski rasmni o'chiradi; xato bo'lsa (fayl allaqachon yo'q) jim o'tadi */
export async function removeImage(name: string) {
  const path = name ? uploadPath(name) : null;
  if (path) await unlink(path).catch(() => {});
}
