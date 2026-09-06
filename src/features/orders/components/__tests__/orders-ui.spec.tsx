import { render, screen } from '@testing-library/react';
import { OrderStatusActions } from '@/features/orders/components/order-status-actions';

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
