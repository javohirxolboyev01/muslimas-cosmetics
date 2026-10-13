import type { ReactNode } from 'react';
import { useShop } from '@/config/shop';
import { Button } from '@/shared/ui';
import './FamilyBanner.css';

interface Props {
  title: ReactNode;
  text: ReactNode;
  action: { label: string; to: string };
  className?: string;
}

/** To'q fonli brend banneri — bosh sahifa va "Biz haqimizda"da qayta ishlatiladi. */
export function FamilyBanner({ title, text, action, className }: Props) {
  const shop = useShop();
  return (
    <div className={className ? `family ${className}` : 'family'}>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
        <Button to={action.to}>{action.label}</Button>
      </div>
      <div className="mark" aria-hidden="true">
        {shop.name}
        <small>Koreys kosmetikasi do'koni</small>
      </div>
    </div>
  );
}
