import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { InventoryPage } from '@/features/inventory/pages/inventory-page';
import { AdjustStockDialog } from '@/features/inventory/components/adjust-stock-dialog';

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

vi.mock('@/features/inventory/hooks/use-inventory', () => ({
  useInventoryListQuery: listQueryMock,
}));

describe('InventoryPage', () => {
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
        <InventoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Inventory' })).toBeInTheDocument();
    expect(screen.getByText('No inventory found.')).toBeInTheDocument();
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
        <InventoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not load inventory')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a soft refresh warning when data is still available', () => {
    const refetch = vi.fn();
    listQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            productId: 1,
            sku: 'SKU-1',
            productTitle: 'Item',
            availableQuantity: 1,
            reservedQuantity: 0,
            totalQuantity: 1,
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: true,
      error: new Error('Too many requests. Wait a moment and try again.'),
      refetch,
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not refresh inventory')).toBeInTheDocument();
    expect(
      screen.getByText('Too many requests. Wait a moment and try again.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Could not load inventory')).not.toBeInTheDocument();
  });
});

describe('AdjustStockDialog', () => {
  it('shows validation errors for empty quantity', async () => {
    const onSubmit = vi.fn();

    render(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        productTitle="Wireless Headphones"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply adjustment' }));

    expect(
      await screen.findByText('Quantity is required'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits mapped DTO on valid input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        productTitle="Wireless Headphones"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply adjustment' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: 'ADD',
        quantity: 10,
      });
    });
  });
});
