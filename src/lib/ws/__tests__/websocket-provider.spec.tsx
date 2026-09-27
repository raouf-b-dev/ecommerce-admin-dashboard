import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

const operatorSession = {
  userId: '1',
  email: 'admin@store.local',
  role: 'ADMIN',
  permissions: ['access_admin', 'view_all_orders'],
  mustChangePassword: false,
};

let authState: {
  isAuthenticated: boolean;
  session: typeof operatorSession | null;
} = {
  isAuthenticated: true,
  session: operatorSession,
};

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authState,
}));

vi.mock('@/lib/auth/auth-session', () => ({
  getAccessToken: () => 'mock-token-123',
}));

function renderProvider(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <div>Dashboard Content</div>
      </WebSocketProvider>
    </QueryClientProvider>,
  );
}

describe('WebSocketProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    authState = {
      isAuthenticated: true,
      session: { ...operatorSession },
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    webSocketService.disconnect();
  });

  it('renders children and displays toast on order and inventory events', () => {
    renderProvider(queryClient);

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    webSocketService.dispatchMock({
      title: 'New Order #2001',
      message: 'Paid with Stripe',
      type: 'order.created',
    });

    expect(toast.info).toHaveBeenCalledWith(
      'New Order #2001',
      expect.objectContaining({ description: 'Paid with Stripe' }),
    );

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

  it('does not disconnect when session identity changes but the access token is unchanged', () => {
    const connect = vi
      .spyOn(webSocketService, 'connect')
      .mockImplementation(() => undefined);
    const disconnect = vi
      .spyOn(webSocketService, 'disconnect')
      .mockImplementation(() => undefined);

    const { rerender } = renderProvider(queryClient);

    expect(connect).toHaveBeenCalledWith('mock-token-123');
    connect.mockClear();
    disconnect.mockClear();

    authState = {
      isAuthenticated: true,
      session: { ...operatorSession },
    };

    rerender(
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <div>Dashboard Content</div>
        </WebSocketProvider>
      </QueryClientProvider>,
    );

    expect(disconnect).not.toHaveBeenCalled();
    expect(connect).toHaveBeenCalledWith('mock-token-123');

    connect.mockRestore();
    disconnect.mockRestore();
  });

  it('disconnects when the operator signs out', () => {
    const connect = vi
      .spyOn(webSocketService, 'connect')
      .mockImplementation(() => undefined);
    const disconnect = vi
      .spyOn(webSocketService, 'disconnect')
      .mockImplementation(() => undefined);

    const { rerender } = renderProvider(queryClient);

    disconnect.mockClear();
    authState = { isAuthenticated: false, session: null };

    rerender(
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <div>Dashboard Content</div>
        </WebSocketProvider>
      </QueryClientProvider>,
    );

    expect(disconnect).toHaveBeenCalled();
    connect.mockRestore();
    disconnect.mockRestore();
  });
});
