import { ORDER_STATUS } from '@/shared/config/constants';
import type { OrderStatus } from '@/shared/types';
import { Badge } from '@/shared/ui';

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={ORDER_STATUS[status].tone} dot>{ORDER_STATUS[status].label}</Badge>
);
