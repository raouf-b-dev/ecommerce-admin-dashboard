export type NotificationEnvelope = {
  id?: string | number;
  title?: string;
  message?: string;
  type?: string;
  payload?: Record<string, unknown>;
  createdAt?: string;
};

export const ORDER_NOTIFICATION_TYPES = [
  'order.created',
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'order.paid',
  'order.status_changed',
] as const;

export const INVENTORY_NOTIFICATION_TYPES = [
  'inventory.low_stock',
  'INVENTORY_LOW_STOCK',
  'inventory.adjusted',
] as const;

export function isOrderNotification(
  notification: NotificationEnvelope,
): boolean {
  const type = notification.type?.toLowerCase() ?? '';
  const title = notification.title?.toLowerCase() ?? '';
  return (
    type.includes('order') ||
    title.includes('order') ||
    Boolean(notification.payload?.orderId)
  );
}

export function isInventoryNotification(
  notification: NotificationEnvelope,
): boolean {
  const type = notification.type?.toLowerCase() ?? '';
  const title = notification.title?.toLowerCase() ?? '';
  return (
    type.includes('inventory') ||
    type.includes('stock') ||
    title.includes('stock') ||
    Boolean(notification.payload?.productId)
  );
}
