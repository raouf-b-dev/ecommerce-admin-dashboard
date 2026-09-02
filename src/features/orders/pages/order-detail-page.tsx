import { Link, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderPaymentPanel } from '@/features/orders/components/order-payment-panel';
import { OrderStatusActions } from '@/features/orders/components/order-status-actions';
import {
  useOrderDetailQuery,
  useOrderPaymentQuery,
  useOrderTransition,
} from '@/features/orders/hooks/use-orders';
import type { OrderStatusAction } from '@/features/orders/types';
import { useAuth } from '@/lib/auth/auth-context';
import {
  getErrorMessage,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';
import { formatDateTime, formatMoney } from '@/lib/format';
import { QueryLoading } from '@/components/feedback/query-state';

const CONFLICT_MESSAGE =
  'Order was modified by another request. Latest values were reloaded — review and try again.';

export function OrderDetailPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_orders');
  const canViewPayments = hasPermission('view_all_payments');
  const params = useParams();
  const orderId = Number(params.orderId);
  const validId = Number.isFinite(orderId) && orderId > 0;
  const detailQuery = useOrderDetailQuery(validId ? orderId : undefined);
  const paymentQuery = useOrderPaymentQuery(
    validId ? orderId : undefined,
    canViewPayments,
  );
  const transition = useOrderTransition(orderId);

  async function handleAction(action: OrderStatusAction) {
    try {
      await transition.mutateAsync(action);
    } catch (error) {
      if (isOptimisticLockConflict(error)) {
        throw new Error(CONFLICT_MESSAGE, { cause: error });
      }
      throw error;
    }
  }

  if (!validId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid order</AlertTitle>
        <AlertDescription>
          The order id in the URL is not valid.
        </AlertDescription>
      </Alert>
    );
  }

  if (detailQuery.isLoading) {
    return <QueryLoading>Loading order…</QueryLoading>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load order</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>
            {getErrorMessage(detailQuery.error, 'Order not found')}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const order = detailQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={order.orderNumber}
        description={`${order.userName} · ${order.userEmail}`}
      >
        <Button asChild variant="outline">
          <Link to="/orders">Back to list</Link>
        </Button>
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="text-lg font-medium capitalize">
            {order.status.replaceAll('_', ' ')}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="text-lg font-medium">
            {formatMoney(order.totalPrice, order.currency)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Created</dt>
          <dd className="text-sm">{formatDateTime(order.createdAt)}</dd>
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <dt className="text-sm text-muted-foreground">Shipping address</dt>
          <dd className="text-sm">{order.shippingAddress}</dd>
        </div>
      </dl>

      {canManage ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Status actions</h2>
          <OrderStatusActions
            status={order.status}
            isPending={transition.isPending}
            onAction={handleAction}
          />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Line items</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={`${item.productId}-${item.sku}`}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {formatMoney(item.unitPrice, order.currency)}
                  </TableCell>
                  <TableCell>
                    {formatMoney(item.subtotal, order.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {canViewPayments ? (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Payment</h2>
          <OrderPaymentPanel
            isLoading={paymentQuery.isLoading}
            isError={paymentQuery.isError}
            error={paymentQuery.error}
            payment={paymentQuery.data}
            onRetry={() => paymentQuery.refetch()}
          />
        </section>
      ) : null}
    </div>
  );
}
