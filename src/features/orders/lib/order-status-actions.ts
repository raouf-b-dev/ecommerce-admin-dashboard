import type { OrderStatusAction } from '@/features/orders/types';

export const ORDER_STATUS_ACTION_LABELS: Record<OrderStatusAction, string> = {
  confirm: 'Confirm',
  process: 'Process',
  ship: 'Ship',
  deliver: 'Deliver',
  cancel: 'Cancel',
};

const KNOWN_ACTIONS = new Set<string>(
  Object.keys(ORDER_STATUS_ACTION_LABELS),
);

/** Narrow API `allowedActions` to known SPA action buttons. */
export function parseAllowedOrderActions(
  actions: readonly string[] | null | undefined,
): OrderStatusAction[] {
  if (!actions?.length) {
    return [];
  }
  return actions.filter((action): action is OrderStatusAction =>
    KNOWN_ACTIONS.has(action),
  );
}
