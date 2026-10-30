import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OrdersTable } from '@/features/orders/components/orders-table';
import { DEFAULT_ORDER_LIST_FILTERS } from '@/features/orders/lib/order-list-filters';
import type { OrderListItemResponseDto } from '@/features/orders/types';

const sampleOrder = {
  id: 12,
  orderNumber: 'ORD-2026-0012',
  status: 'confirmed',
  userId: 3,
  userName: 'Jane Doe',
  userEmail: 'jane@example.com',
  itemCount: 2,
  totalAmount: 49.5,
  currency: 'USD',
  createdAt: '2026-03-01T12:00:00.000Z',
} satisfies OrderListItemResponseDto;

describe('OrdersTable', () => {
  it('exposes a labelled horizontal scroll region for narrow viewports', () => {
    render(
      <MemoryRouter>
        <OrdersTable
          items={[sampleOrder]}
          total={1}
          filters={DEFAULT_ORDER_LIST_FILTERS}
          hasActiveFilters={false}
          onFiltersChange={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('region', { name: 'Orders' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-0012')).toBeInTheDocument();
  });
});
