import { describe, expect, it } from 'vitest';
import { orderTotals, shippingCost } from './pricing';
import { canTransition } from './constants';
import { formatPhone, isValidPhone } from './phone';

const S = { freeFrom: 500_000, shipCourier: 25_000, shipPost: 35_000 };

describe('pricing', () => {
  it('kuryer: chegaradan past — pullik, yuqori — bepul', () => {
    expect(shippingCost('courier', 499_999, S)).toBe(25_000);
    expect(shippingCost('courier', 500_000, S)).toBe(0);
  });
  it('pochta har doim pullik, olib ketish bepul', () => {
    expect(shippingCost('post', 1_000_000, S)).toBe(35_000);
    expect(shippingCost('pickup', 1, S)).toBe(0);
  });
  it('bepul yetkazish chegirmadan keyingi summaga qaraydi', () => {
    // 550 000 − 15% = 467 500 → kuryer pullik
    const t = orderTotals([{ price: 275_000, qty: 2 }], 15, 'courier', S);
    expect(t).toEqual({ sub: 550_000, disc: 82_500, ship: 25_000, total: 492_500 });
  });
});

describe('order transitions', () => {
  it('yakuniy holatdan chiqib bo‘lmaydi', () => {
    expect(canTransition('delivered', 'processing')).toBe(false);
    expect(canTransition('cancelled', 'new')).toBe(false);
    expect(canTransition('new', 'processing')).toBe(true);
    expect(canTransition('new', 'delivered')).toBe(false);
  });
});

describe('phone', () => {
  it('formatlaydi va tekshiradi', () => {
    expect(formatPhone('998901234567')).toBe('+998 90 123 45 67');
    expect(isValidPhone('+998 90 123 45 67')).toBe(true);
    expect(isValidPhone('90 123')).toBe(false);
  });
});
