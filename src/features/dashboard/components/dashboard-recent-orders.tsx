import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import type { OrderListItemResponseDto } from '@/features/orders/types';
import { formatMoney } from '@/lib/format';

type Props = {
  items: OrderListItemResponseDto[];
};

export function DashboardRecentOrders({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No recent orders.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border/80">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  to={`/orders/${order.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.userEmail}
              </TableCell>
              <TableCell>
                <StatusBadge variant="order" status={order.status} />
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums text-foreground">
                {formatMoney(order.totalAmount, order.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
