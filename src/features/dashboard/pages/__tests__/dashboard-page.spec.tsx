import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { ApiRequestError } from '@/lib/api/parse-api-error';

const overviewMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as
      | {
          timezone: 'UTC';
          from: string;
          to: string;
          current: {
            netRevenue: number;
            grossRevenue: number;
            refundedAmount: number;
            ordersCount: number;
            paidOrderCount: number;
            aov: number;
            currency: string;
          };
          previous: {
            netRevenue: number;
            grossRevenue: number;
            refundedAmount: number;
            ordersCount: number;
            paidOrderCount: number;
            aov: number;
            currency: string;
          };
          ordersNeedingAttention: { status: string; count: number }[];
          lowStockCount: number;
        }
      | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const seriesMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as
      | {
          buckets: {
            bucketStart: string;
            netAmount: number;
            currency: string;
            grossAmount: number;
            refundedAmount: number;
            capturedCount: number;
          }[];
        }
      | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const topMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as { items: unknown[] } | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const alertsMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as { items: unknown[] } | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const recentMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as { items: unknown[] } | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const hasPermissionMock = vi.hoisted(() => vi.fn(() => true));
const alertsEnabledCalls = vi.hoisted(() => [] as boolean[]);

vi.mock('@/features/dashboard/hooks/use-dashboard', () => ({
  useDashboardOverviewQuery: () => overviewMock(),
  useDashboardRevenueSeriesQuery: () => seriesMock(),
  useDashboardTopProductsQuery: () => topMock(),
  useDashboardInventoryAlertsQuery: (enabled: boolean) => {
    alertsEnabledCalls.push(enabled);
    return alertsMock();
  },
  useDashboardRecentOrdersQuery: () => recentMock(),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    hasPermission: hasPermissionMock,
  }),
}));

function renderDashboard(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <DashboardPage />
    </MemoryRouter>,
  );
}

function emptyQuery() {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
}

describe('DashboardPage', () => {
  beforeEach(() => {
    overviewMock.mockReset();
    seriesMock.mockReset();
    topMock.mockReset();
    alertsMock.mockReset();
    recentMock.mockReset();
    hasPermissionMock.mockReset();
    hasPermissionMock.mockReturnValue(true);
    alertsEnabledCalls.length = 0;

    overviewMock.mockReturnValue(emptyQuery());
    seriesMock.mockReturnValue(emptyQuery());
    topMock.mockReturnValue(emptyQuery());
    alertsMock.mockReturnValue(emptyQuery());
    recentMock.mockReturnValue(emptyQuery());
  });

  it('renders empty overview state without inventing metrics', () => {
    overviewMock.mockReturnValue({
      data: {
        timezone: 'UTC',
        from: '2026-08-23T00:00:00.000Z',
        to: '2026-08-30T00:00:00.000Z',
        current: {
          netRevenue: 0,
          grossRevenue: 0,
          refundedAmount: 0,
          ordersCount: 0,
          paidOrderCount: 0,
          aov: 0,
          currency: 'USD',
        },
        previous: {
          netRevenue: 0,
          grossRevenue: 0,
          refundedAmount: 0,
          ordersCount: 0,
          paidOrderCount: 0,
          aov: 0,
          currency: 'USD',
        },
        ordersNeedingAttention: [],
        lowStockCount: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    seriesMock.mockReturnValue({
      data: {
        buckets: [
          {
            bucketStart: '2026-08-23T00:00:00.000Z',
            netAmount: 0,
            grossAmount: 0,
            refundedAmount: 0,
            capturedCount: 0,
            currency: 'USD',
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    topMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    alertsMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    recentMock.mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByText('No orders need attention right now.')).toBeInTheDocument();
    expect(screen.getByText('No captured revenue in this period.')).toBeInTheDocument();
  });

  it('reads period from ?days= URL param', () => {
    renderDashboard('/?days=30');
    expect(screen.getByLabelText('Period')).toHaveValue('30');
  });

  it('shows section error with retry when overview fails', () => {
    const refetch = vi.fn();
    overviewMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiRequestError({
        statusCode: 500,
        message: 'Failed to load dashboard overview',
      }),
      refetch,
    });

    renderDashboard();

    expect(screen.getByText('Could not load summary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('hides payments chart when view_all_payments is missing', () => {
    hasPermissionMock.mockImplementation(
      (permission?: string) => permission !== 'view_all_payments',
    );
    overviewMock.mockReturnValue({
      data: {
        timezone: 'UTC',
        from: 'a',
        to: 'b',
        current: {
          netRevenue: 10,
          grossRevenue: 10,
          refundedAmount: 0,
          ordersCount: 1,
          paidOrderCount: 1,
          aov: 10,
          currency: 'USD',
        },
        previous: {
          netRevenue: 5,
          grossRevenue: 5,
          refundedAmount: 0,
          ordersCount: 1,
          paidOrderCount: 1,
          aov: 5,
          currency: 'USD',
        },
        ordersNeedingAttention: [],
        lowStockCount: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(
      screen.queryByRole('region', { name: 'Net revenue' }),
    ).not.toBeInTheDocument();
  });

  it('hides inventory widgets when permission is missing', () => {
    hasPermissionMock.mockImplementation(
      (permission?: string) => permission !== 'view_all_inventory',
    );
    overviewMock.mockReturnValue({
      data: {
        timezone: 'UTC',
        from: 'a',
        to: 'b',
        current: {
          netRevenue: 10,
          grossRevenue: 10,
          refundedAmount: 0,
          ordersCount: 1,
          paidOrderCount: 1,
          aov: 10,
          currency: 'USD',
        },
        previous: {
          netRevenue: 5,
          grossRevenue: 5,
          refundedAmount: 0,
          ordersCount: 1,
          paidOrderCount: 1,
          aov: 5,
          currency: 'USD',
        },
        ordersNeedingAttention: [],
        lowStockCount: 3,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    renderDashboard();

    expect(screen.queryByText('Low stock')).not.toBeInTheDocument();
    expect(alertsEnabledCalls).toContain(false);
  });
});
