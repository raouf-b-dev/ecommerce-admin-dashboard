import { Link, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { StatusBadge } from '@/components/ui/status-badge';

const CONFLICT_MESSAGE =
  'Order was modified by another request. Latest values were reloaded — review and try again.';

function OrderDetailPage() {
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
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.userName} · ${order.userEmail}`}
      >
        <Button asChild variant="outline">
          <Link to="/orders">Back to list</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 cols: Line items & Financial Summary */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Line items</CardTitle>
                <CardDescription className="text-xs">
                  Products and quantities ordered
                </CardDescription>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">SKU</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="pr-6 text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={`${item.productId}-${item.sku}`}>
                      <TableCell className="pl-6 font-mono text-xs font-medium text-muted-foreground">
                        {item.sku}
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(item.unitPrice, order.currency)}
                      </TableCell>
                      <TableCell className="pr-6 text-right font-medium tabular-nums">
                        {formatMoney(item.subtotal, order.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Financial summary</CardTitle>
              <CardDescription className="text-xs">
                Total billed amount for this order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-2 text-sm">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-mono font-medium text-foreground">{order.currency}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2 text-sm">
                <span className="text-muted-foreground">Item count</span>
                <span className="font-medium text-foreground">{order.items.length}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-semibold text-foreground">Order total</span>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {formatMoney(order.totalPrice, order.currency)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Status & Actions, Customer, Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Order status</CardTitle>
              <CardDescription className="text-xs">
                Lifecycle status and transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge variant="order" status={order.status} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">{formatDateTime(order.createdAt)}</span>
              </div>
              {canManage ? (
                <div className="border-t border-border pt-3 space-y-2">
                  <h2 className="text-sm font-medium text-foreground">Status actions</h2>
                  <OrderStatusActions
                    status={order.status}
                    isPending={transition.isPending}
                    onAction={handleAction}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Customer & shipping</CardTitle>
              <CardDescription className="text-xs">
                Recipient and delivery destination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Customer</span>
                <p className="font-medium text-foreground">{order.userName}</p>
                <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                <p className="text-xs text-muted-foreground">User #{order.userId}</p>
              </div>
              <div className="border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Shipping address</span>
                <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/40 p-2.5 text-xs text-foreground">
                  {order.shippingAddress}
                </p>
              </div>
            </CardContent>
          </Card>

          {canViewPayments ? (
            <Card>
              <CardHeader className="pb-3">
                <h2 className="text-base font-semibold text-card-foreground">Payment</h2>
                <CardDescription className="text-xs">
                  Payment record and transaction status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderPaymentPanel
                  isLoading={paymentQuery.isLoading}
                  isError={paymentQuery.isError}
                  error={paymentQuery.error}
                  payment={paymentQuery.data}
                  onRetry={() => paymentQuery.refetch()}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { OrderDetailPage };
export default OrderDetailPage;
