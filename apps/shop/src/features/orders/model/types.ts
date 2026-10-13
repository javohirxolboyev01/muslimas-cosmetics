import type { CreateOrderInput, PublicOrder } from '@mc/shared';

export type { DeliveryMethod, OrderItem, OrderRef, OrderStatus, PaymentMethod } from '@mc/shared';

export type Order = PublicOrder;
export type CreateOrderPayload = CreateOrderInput;
