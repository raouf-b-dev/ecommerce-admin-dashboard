import type {
  OrderStatus,
  OrderStatusAction,
} from '@/features/orders/types';

/**
 * UX chrome only — mirrors API OrderWorkflow for enabling/disabling controls.
 * The API remains the authority on illegal transitions.
 */
const ACTIONS_BY_STATUS: Record<OrderStatus, OrderStatusAction[]> = {
  pending_payment: ['confirm', 'cancel'],
  payment_failed: ['cancel'],
  confirmed: ['process', 'cancel'],
  processing: ['ship', 'cancel'],
  shipped: ['deliver', 'cancel'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

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
    return ACTIONS_BY_STATUS[status as OrderStatus];
  }
  return [];
}

export function isOrderActionAllowed(
  status: OrderStatus | string,
  action: OrderStatusAction,
): boolean {
  return getAllowedOrderActions(status).includes(action);
}
