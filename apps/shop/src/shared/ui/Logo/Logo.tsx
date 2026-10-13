import { Link } from 'react-router-dom';
import { useShop } from '@/config/shop';
import { cn } from '@/shared/lib/cn';
import './Logo.css';

export function Logo({ variant = 'dark' }: { variant?: 'dark' | 'footer' }) {
  const { name } = useShop();
  return (
    <Link to="/" className={cn('logo', variant === 'footer' && 'logo-footer')} aria-label={`${name} — bosh sahifa`}>
      {name}
    </Link>
  );
}
