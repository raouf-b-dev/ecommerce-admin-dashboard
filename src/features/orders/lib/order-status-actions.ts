import type { OrderStatus, OrderStatusAction } from '@/features/orders/types';

/**
 * UX chrome only — mirrors the API order workflow for enabling/disabling
 * controls. Illegal transitions are still rejected by the API.
 */
const ACTIONS_BY_STATUS = {
  pending_payment: ['confirm', 'cancel'],
  payment_failed: ['cancel'],
  confirmed: ['process', 'cancel'],
  processing: ['ship', 'cancel'],
  shipped: ['deliver', 'cancel'],
  delivered: [],
  cancelled: [],
  refunded: [],
} as const satisfies Record<OrderStatus, readonly OrderStatusAction[]>;

export const ORDER_STATUS_ACTION_LABELS: Record<OrderStatusAction, string> = {
  confirm: 'Confirm',
  process: 'Process',
  ship: 'Ship',
  deliver: 'Deliver',
  cancel: 'Cancel',
};

export function getAllowedOrderActions(
  status: OrderStatus | string,
): OrderStatusAction[] {
  if (status in ACTIONS_BY_STATUS) {
    return [...ACTIONS_BY_STATUS[status as OrderStatus]];
  }
  return [];
}
