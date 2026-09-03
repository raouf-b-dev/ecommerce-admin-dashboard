import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebSocketProvider } from '@/lib/ws/websocket-provider';
import { webSocketService } from '@/lib/ws/websocket-service';

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

import { toast } from 'sonner';

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    session: {
      userId: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
      permissions: ['access_admin', 'view_all_orders'],
      mustChangePassword: false,
    },
  }),
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getAccessToken: () => 'mock-token-123',
}));

describe('WebSocketProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  it('renders children and displays toast on order and inventory events', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <div>Dashboard Content</div>
        </WebSocketProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    // Dispatch order notification
    webSocketService.dispatchMock({
      title: 'New Order #2001',
      message: 'Paid with Stripe',
      type: 'order.created',
    });

    expect(toast.info).toHaveBeenCalledWith(
      'New Order #2001',
      expect.objectContaining({ description: 'Paid with Stripe' }),
    );

    // Dispatch low stock notification
    webSocketService.dispatchMock({
      title: 'Low Stock on SKU-99',
      message: 'Quantity below threshold',
      type: 'inventory.low_stock',
    });

    expect(toast.warning).toHaveBeenCalledWith(
      'Low Stock on SKU-99',
      expect.objectContaining({ description: 'Quantity below threshold' }),
    );
  });
});
