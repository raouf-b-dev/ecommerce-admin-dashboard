import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/ui/status-badge';

describe('StatusBadge', () => {
  it('renders order statuses correctly', () => {
    const { rerender } = render(<StatusBadge variant="order" status="delivered" />);
    expect(screen.getByText(/delivered/i)).toBeInTheDocument();

    rerender(<StatusBadge variant="order" status="pending_payment" />);
    expect(screen.getByText(/pending payment/i)).toBeInTheDocument();

    rerender(<StatusBadge variant="order" status="payment_failed" />);
    expect(screen.getByText(/payment failed/i)).toBeInTheDocument();

    rerender(<StatusBadge variant="order" status="confirmed" />);
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
  });

  it('renders product statuses correctly', () => {
    const { rerender } = render(<StatusBadge variant="product" isActive={true} />);
    expect(screen.getByText('Active')).toBeInTheDocument();

    rerender(<StatusBadge variant="product" isActive={false} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders inventory statuses correctly', () => {
    const { rerender } = render(
      <StatusBadge
        variant="inventory"
        availableQuantity={0}
        lowStockThreshold={5}
      />,
    );
    expect(screen.getByText('Critical')).toBeInTheDocument();

    rerender(
      <StatusBadge
        variant="inventory"
        availableQuantity={3}
        lowStockThreshold={5}
      />,
    );
    expect(screen.getByText('Low stock')).toBeInTheDocument();

    rerender(
      <StatusBadge
        variant="inventory"
        availableQuantity={20}
        lowStockThreshold={5}
      />,
    );
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });
});
