import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { isApiError } from '@/shared/api/http';
import { useCartStore } from '../model/cartStore';
import { toast } from '@/shared/toast/toastStore';
import './Summary.css';

export function CouponForm() {
  const coupon = useCartStore((s) => s.coupon);
  const apply = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [value, setValue] = useState('');
  const check = useMutation({ mutationFn: catalogService.checkCoupon });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (coupon) {
      removeCoupon();
      setValue('');
      return;
    }
    if (!value.trim() || check.isPending) return;
    check.mutate(value, {
      onSuccess: (c) => {
        apply(c.code, c.percent);
        toast(`Promokod qo'llandi: −${c.percent}%`);
      },
      onError: (err) =>
        toast(isApiError(err) && err.status === 404 ? "Promokod noto'g'ri. Qayta tekshiring" : "Promokodni tekshirib bo'lmadi. Qayta urinib ko'ring"),
    });
  };

  return (
    <form className="coupon" onSubmit={onSubmit}>
      <input
        placeholder="Promokod"
        aria-label="Promokod"
        value={coupon || value}
        disabled={!!coupon || check.isPending}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" disabled={check.isPending}>{coupon ? 'Olib tashlash' : check.isPending ? '…' : "Qo'llash"}</button>
    </form>
  );
}
