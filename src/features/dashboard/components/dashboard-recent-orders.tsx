import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderListItemResponseDto } from '@/features/orders/types';
import { formatMoney } from '@/features/dashboard/lib/dashboard-metrics';

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link
                to={`/orders/${order.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{order.userEmail}</TableCell>
            <TableCell className="capitalize">
              {order.status.replaceAll('_', ' ')}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatMoney(order.totalAmount, order.currency)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
