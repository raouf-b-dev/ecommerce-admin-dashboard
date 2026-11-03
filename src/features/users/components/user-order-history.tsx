import { Link } from 'react-router';
import {
  QueryLoading,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useOrdersListQuery } from '@/features/orders/hooks/use-orders';
import { formatDateTime, formatMoney } from '@/lib/format';

type UserOrderHistoryProps = {
  userId: number;
};

export function UserOrderHistory({ userId }: UserOrderHistoryProps) {
  const ordersQuery = useOrdersListQuery({
    userId,
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
        <div>
          <CardTitle as="h2" className="text-xl">
            Order history
          </CardTitle>
          <CardDescription className="mt-1">
            Recent orders for this account.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={`/orders?userId=${userId}`}>View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <QueryStateAlert
          isError={ordersQuery.isError}
          hasData={Boolean(ordersQuery.data)}
          error={ordersQuery.error}
          onRetry={() => void ordersQuery.refetch()}
          resource="orders"
        />

        {ordersQuery.isLoading ? (
          <QueryLoading>Loading orders…</QueryLoading>
        ) : null}

        {ordersQuery.data ? (
          ordersQuery.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-border/80">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Placed</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordersQuery.data.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link
                          to={`/orders/${order.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant="order" status={order.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-foreground">
                        {formatMoney(order.totalAmount, order.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
