import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrderPaymentPanel } from '@/features/orders/components/order-payment-panel';
import type { PaymentDetailResponseDto } from '@/features/orders/types';

const basePayment = {
  id: 1,
  orderId: 10,
  userId: 3,
  userName: 'Jane Doe',
  userEmail: 'customer@store.local',
  amount: 150,
  currency: 'USD',
  status: 'completed',
  paymentMethod: 'CARD',
  transactionId: 'txn_123',
  createdAt: '2026-03-01T12:00:00.000Z',
  gatewayPaymentIntentId: 'pi_123',
  failureReason: null,
  metadata: null,
  updatedAt: '2026-03-01T12:00:00.000Z',
} satisfies PaymentDetailResponseDto;

describe('OrderPaymentPanel', () => {
  it('shows loading indicator when isLoading is true', () => {
    render(
      <OrderPaymentPanel
        isLoading={true}
        isError={false}
        error={null}
        payment={null}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText(/loading payment/i)).toBeInTheDocument();
  });

  it('shows error alert and triggers retry callback on click when isError is true', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn<() => void>();

    render(
      <OrderPaymentPanel
        isLoading={false}
        isError={true}
        error={new Error('Failed to fetch payment')}
        payment={null}
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByText('Could not load payment')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch payment')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('shows empty message when payment is null', () => {
    render(
      <OrderPaymentPanel
        isLoading={false}
        isError={false}
        error={null}
        payment={null}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(
      screen.getByText('No payment recorded for this order.'),
    ).toBeInTheDocument();
  });

  it('renders Card label when payment method is CARD', () => {
    render(
      <OrderPaymentPanel
        isLoading={false}
        isError={false}
        error={null}
        payment={basePayment}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText('Method')).toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.queryByText('CARD')).not.toBeInTheDocument();
  });

  it('shows failure reason when payment has failureReason', () => {
    const failedPayment = {
      ...basePayment,
      status: 'failed',
      failureReason: 'Card declined by issuing bank',
    } satisfies PaymentDetailResponseDto;

    render(
      <OrderPaymentPanel
        isLoading={false}
        isError={false}
        error={null}
        payment={failedPayment}
        onRetry={vi.fn<() => void>()}
      />,
    );

    expect(screen.getByText('Failure reason')).toBeInTheDocument();
    expect(
      screen.getByText('Card declined by issuing bank'),
    ).toBeInTheDocument();
  });
});
