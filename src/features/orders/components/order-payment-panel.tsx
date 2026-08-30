import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { QueryLoading } from '@/components/feedback/query-state';
import type { PaymentDetailResponseDto } from '@/features/orders/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import { formatDateTime, formatMoney } from '@/lib/format';

type OrderPaymentPanelProps = {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  payment: PaymentDetailResponseDto | null | undefined;
  onRetry: () => void;
};

export function OrderPaymentPanel({
  isLoading,
  isError,
  error,
  payment,
  onRetry,
}: OrderPaymentPanelProps) {
  if (isLoading) {
    return <QueryLoading>Loading payment…</QueryLoading>;
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
        <dd className="text-sm">{formatDateTime(payment.createdAt)}</dd>
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
