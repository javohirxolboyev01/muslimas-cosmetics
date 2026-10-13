import { cn } from '@/shared/lib/cn';
import './Badge.css';

export function Badge({ count }: { count: number }) {
  return (
    <span className={cn('badge', count > 0 && 'on')} aria-hidden={count === 0}>
      {count}
    </span>
  );
}
