import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/auth-context';
import { getAccessToken } from '@/lib/auth/auth-session';
import { orderKeys } from '@/features/orders/hooks/order-keys';
import { inventoryKeys } from '@/features/inventory/hooks/inventory-keys';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import {
  isInventoryNotification,
  isOrderNotification,
} from '@/lib/ws/notification-types';
import { webSocketService } from '@/lib/ws/websocket-service';

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, session } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !session) {
      webSocketService.disconnect();
      return;
    }

    const token = getAccessToken();
    if (token) {
      // connect() no-ops when the socket is already up with this token; it
      // reconnects only when the access token actually changed (JWT handshake).
      webSocketService.connect(token);
    }
  }, [isAuthenticated, session]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const unsubscribe = webSocketService.subscribe((notification) => {
      if (isOrderNotification(notification)) {
        toast.info(notification.title || 'New order update', {
          description: notification.message || 'Order status has been updated.',
        });
        void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
        return;
      }

      if (isInventoryNotification(notification)) {
        toast.warning(notification.title || 'Low stock alert', {
          description:
            notification.message || 'Product stock is below threshold.',
        });
        void queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
        return;
      }

      toast(notification.title || 'System Notification', {
        description: notification.message,
      });
    });

    return unsubscribe;
  }, [isAuthenticated, queryClient]);

  return <>{children}</>;
}
