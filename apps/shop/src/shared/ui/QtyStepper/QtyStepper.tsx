import { cn } from '@/shared/lib/cn';
import './QtyStepper.css';

interface Props {
  value: number;
  onChange: (delta: number) => void;
  size?: 'md' | 'sm';
  className?: string;
}

export function QtyStepper({ value, onChange, size = 'md', className }: Props) {
  return (
    <div className={cn('qty', size === 'sm' && 'qty-sm', className)}>
      <button type="button" onClick={() => onChange(-1)} aria-label="Kamaytirish">−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(1)} aria-label="Ko'paytirish">+</button>
    </div>
  );
}
