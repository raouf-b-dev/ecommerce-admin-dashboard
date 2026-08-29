import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import { OrderStatusActions } from '@/features/orders/components/order-status-actions';

type ListQueryResult = {
  data:
    | {
        items: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
  isFetching: boolean;
};

const listQueryMock = vi.hoisted(() =>
  vi.fn((): ListQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  })),
);

const detailQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as
      | {
          id: number;
          orderNumber: string;
          userId: number;
          userName: string;
          userEmail: string;
          status: string;
          shippingAddress: string;
          items: {
            productId: number;
            sku: string;
            title: string;
            unitPrice: number;
            quantity: number;
            subtotal: number;
          }[];
          totalAmount: number;
          totalPrice: number;
          currency: string;
          createdAt: string;
          updatedAt: string;
        }
      | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const paymentQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const transitionMock = vi.hoisted(() =>
  vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
);

const authMock = vi.hoisted(() =>
  vi.fn(() => ({
    hasPermission: (permission: string) =>
      permission === 'manage_orders' || permission === 'view_all_payments',
  })),
);

vi.mock('@/features/orders/hooks/use-orders', () => ({
  useOrdersListQuery: listQueryMock,
  useOrderDetailQuery: detailQueryMock,
  useOrderPaymentQuery: paymentQueryMock,
  useOrderTransition: transitionMock,
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authMock(),
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    listQueryMock.mockReset();
  });

  it('shows empty table message when there are no items', () => {
    listQueryMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('shows error alert with retry when the query fails', () => {
    const refetch = vi.fn();
    listQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network down'),
      refetch,
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not load orders')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });
});

describe('OrderStatusActions', () => {
  it('enables process and cancel for confirmed orders', () => {
    render(
      <OrderStatusActions
        status="confirmed"
        isPending={false}
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Process' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Ship' })).not.toBeInTheDocument();
  });

  it('shows no action buttons for delivered orders', () => {
    render(
      <OrderStatusActions
        status="delivered"
        isPending={false}
        onAction={vi.fn()}
      />,
    );

    expect(
      screen.getByText('No status actions available for this order.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Process' })).not.toBeInTheDocument();
  });
});

describe('OrderDetailPage', () => {
  beforeEach(() => {
    detailQueryMock.mockReset();
    paymentQueryMock.mockReset();
    transitionMock.mockReset();
    authMock.mockReset();
    authMock.mockReturnValue({
      hasPermission: (permission: string) =>
        permission === 'manage_orders' || permission === 'view_all_payments',
    });
    transitionMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    paymentQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('hides status actions without manage_orders', () => {
    authMock.mockReturnValue({
      hasPermission: (permission: string) =>
        permission === 'view_all_payments',
    });
    detailQueryMock.mockReturnValue({
      data: {
        id: 1,
        orderNumber: 'ORD-1',
        userId: 3,
        userName: 'Jane Doe',
        userEmail: 'customer@store.local',
        status: 'confirmed',
        shippingAddress: '123 Main',
        items: [
          {
            productId: 1,
            sku: 'SKU-1',
            title: 'Item',
            unitPrice: 10,
            quantity: 1,
            subtotal: 10,
          },
        ],
        totalAmount: 10,
        totalPrice: 10,
        currency: 'USD',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/orders/1']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'ORD-1' })).toBeInTheDocument();
    expect(screen.queryByText('Status actions')).not.toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('hides payment panel without view_all_payments', () => {
    authMock.mockReturnValue({
      hasPermission: (permission: string) => permission === 'manage_orders',
    });
    detailQueryMock.mockReturnValue({
      data: {
        id: 1,
        orderNumber: 'ORD-1',
        userId: 3,
        userName: 'Jane Doe',
        userEmail: 'customer@store.local',
        status: 'confirmed',
        shippingAddress: '123 Main',
        items: [],
        totalAmount: 10,
        totalPrice: 10,
        currency: 'USD',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/orders/1']}>
        <Routes>
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Status actions')).toBeInTheDocument();
    expect(screen.queryByText('Payment')).not.toBeInTheDocument();
  });
});
