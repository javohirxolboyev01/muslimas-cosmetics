import { Icon } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useIsWished } from '../model/wishlistStore';
import { useToggleWish } from '../hooks/useToggleWish';
import './WishButton.css';

export function WishButton({ productId, className, bordered }: { productId: number; className?: string; bordered?: boolean }) {
  const on = useIsWished(productId);
  const toggle = useToggleWish();
  return (
    <button
      type="button"
      className={cn('heart', on && 'on', bordered && 'heart-bordered', className)}
      onClick={() => toggle(productId)}
      aria-label={on ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
      aria-pressed={on}
    >
      <Icon name="heart" />
    </button>
  );
}
