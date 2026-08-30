import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { PaymentDetailResponseDto } from '@/features/orders/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';

type OrderPaymentPanelProps = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  payment: PaymentDetailResponseDto | null | undefined;
  onRetry: () => void;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function OrderPaymentPanel({
  isLoading,
  isError,
  error,
  payment,
  onRetry,
}: OrderPaymentPanelProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading payment…</p>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load payment</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>
            {error instanceof ApiRequestError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'Payment not found'}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return (
      <p className="text-sm text-muted-foreground">
        No payment recorded for this order.
      </p>
    );
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1">
        <dt className="text-sm text-muted-foreground">Status</dt>
        <dd className="capitalize">{payment.status.replaceAll('_', ' ')}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm text-muted-foreground">Amount</dt>
        <dd>{formatMoney(payment.amount, payment.currency)}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm text-muted-foreground">Method</dt>
        <dd className="capitalize">{payment.paymentMethod}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm text-muted-foreground">Transaction ID</dt>
        <dd className="font-mono text-sm">{payment.transactionId || '—'}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm text-muted-foreground">Created</dt>
        <dd className="text-sm">{formatDate(payment.createdAt)}</dd>
      </div>
      {payment.failureReason ? (
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <dt className="text-sm text-muted-foreground">Failure reason</dt>
          <dd className="text-sm">{payment.failureReason}</dd>
        </div>
      ) : null}
    </dl>
  );
}
