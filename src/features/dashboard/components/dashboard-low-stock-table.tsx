import { Link } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InventoryAlertItemDto } from '@/features/dashboard/types';

type Props = {
  items: InventoryAlertItemDto[];
};

export function DashboardLowStockTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No low-stock SKUs.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Available</TableHead>
          <TableHead>Threshold</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.productId}>
            <TableCell>
              <Link
                to={`/inventory/${item.productId}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {item.productTitle || `Product #${item.productId}`}
              </Link>
            </TableCell>
            <TableCell className="tabular-nums">{item.sku ?? '—'}</TableCell>
            <TableCell className="tabular-nums">
              {item.availableQuantity}
            </TableCell>
            <TableCell className="tabular-nums">
              {item.lowStockThreshold}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
