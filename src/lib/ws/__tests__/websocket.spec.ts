import { describe, expect, it, vi } from 'vitest';
import {
  isInventoryNotification,
  isOrderNotification,
  type NotificationEnvelope,
} from '@/lib/ws/notification-types';
import { webSocketService } from '@/lib/ws/websocket-service';

describe('WebSocket notification helpers and service', () => {
  it('correctly identifies order notifications', () => {
    expect(isOrderNotification({ type: 'order.created' })).toBe(true);
    expect(isOrderNotification({ type: 'ORDER_CONFIRMED' })).toBe(true);
    expect(isOrderNotification({ title: 'New customer order' })).toBe(true);
    expect(isOrderNotification({ payload: { orderId: 100 } })).toBe(true);

    expect(isOrderNotification({ type: 'inventory.low_stock' })).toBe(false);
    expect(isOrderNotification({})).toBe(false);
  });

  it('correctly identifies inventory notifications', () => {
    expect(isInventoryNotification({ type: 'inventory.low_stock' })).toBe(true);
    expect(isInventoryNotification({ type: 'INVENTORY_LOW_STOCK' })).toBe(true);
    expect(isInventoryNotification({ title: 'Low stock warning' })).toBe(true);
    expect(isInventoryNotification({ payload: { productId: 5 } })).toBe(true);

    expect(isInventoryNotification({ type: 'order.created' })).toBe(false);
    expect(isInventoryNotification({})).toBe(false);
  });

  it('dispatches mock notifications to active subscribers and allows unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = webSocketService.subscribe(listener);

    const notification: Partial<NotificationEnvelope> = {
      title: 'Test Notification',
      message: 'Test message content',
      type: 'order.created',
    };

    webSocketService.dispatchMock(notification);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Notification',
        message: 'Test message content',
        type: 'order.created',
      }),
    );

    unsubscribe();

    webSocketService.dispatchMock(notification);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
