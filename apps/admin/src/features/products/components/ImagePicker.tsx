import { useRef, useState, type DragEvent } from 'react';
import { useController, useWatch, type Control } from 'react-hook-form';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import { cn } from '@/shared/lib/cn';
import { IMAGE_ACCEPT, prepareProductImage } from '@/shared/lib/productImage';
import { Button, Icon, ProductThumb, Spinner } from '@/shared/ui';
import { productsApi } from '../api';
import type { ProductFormValues } from '../schema';
import styles from './ProductForm.module.css';

/**
 * Mahsulot rasmi: tanlangan zahoti kichraytirilib serverga yuklanadi, formaga faqat fayl nomi yoziladi.
 * Rasm bo'lmasa shakl va ranglardan chizilgan illyustratsiya ko'rsatiladi.
 */
export function ImagePicker({ control }: { control: Control<ProductFormValues> }) {
  const { field } = useController({ control, name: 'image' });
  const [shape, color1, color2, bg, name] = useWatch({ control, name: ['shape', 'color1', 'color2', 'bg', 'name'] });
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError('');
    setUploading(true);
    try {
      const blob = await prepareProductImage(file);
      field.onChange(await productsApi.uploadImage(blob));
    } catch (e) {
      setError(isApiError(e) && e.status === 413 ? 'Rasm juda katta (5 MB gacha)' : getErrorMessage(e));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = '';
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    void upload(e.dataTransfer.files[0]);
  };

  const pick = () => input.current?.click();
  const hasImage = Boolean(field.value);

  return (
    <div className={styles.preview}>
      <button
        type="button"
        className={cn(styles.drop, dragOver && styles.dropOver, hasImage && styles.dropFilled)}
        onClick={pick}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={uploading}
        aria-label={hasImage ? 'Rasmni almashtirish' : 'Rasm yuklash'}
      >
        <ProductThumb product={{ shape, color1, color2, bg, image: field.value }} size={hasImage ? 200 : 140} />
        {uploading && <span className={styles.dropBusy}><Spinner size={28} /></span>}
        {!hasImage && !uploading && (
          <span className={styles.dropHint}>
            <Icon name="image" size={18} />
            Rasm yuklash
          </span>
        )}
      </button>
      <input ref={input} type="file" accept={IMAGE_ACCEPT} hidden onChange={(e) => void upload(e.target.files?.[0])} />

      <p className={styles.previewName}>{name || 'Mahsulot nomi'}</p>
      {hasImage ? (
        <div className={styles.imageActions}>
          <Button size="sm" variant="secondary" icon="refresh" onClick={pick} loading={uploading}>Almashtirish</Button>
          <Button size="sm" variant="ghost" icon="trash" onClick={() => field.onChange('')} disabled={uploading}>O'chirish</Button>
        </div>
      ) : (
        <p className={styles.imageHint}>Bosing va galereyadan rasm tanlang (kompyuterda shu yerga tortib tashlash ham mumkin). Rasm bo'lmasa, quyidagi shakl va ranglardan illyustratsiya chiziladi.</p>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
