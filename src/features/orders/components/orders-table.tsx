import { Link } from 'react-router';
import {
  flexRender,
  tableFeatures,
  useTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { formatDateTime, formatMoney, formatStatusLabel } from '@/lib/format';
import type {
  OrderListFilters,
  OrderListItemResponseDto,
} from '@/features/orders/types';

type OrdersTableProps = {
  items: OrderListItemResponseDto[];
  total: number;
  filters: OrderListFilters;
  onFiltersChange: (next: OrderListFilters) => void;
};

const features = tableFeatures({});

export function OrdersTable({
  items,
  total,
  filters,
  onFiltersChange,
}: OrdersTableProps) {
  const columns: ColumnDef<typeof features, OrderListItemResponseDto>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div>{row.original.userName}</div>
          <div className="text-muted-foreground">{row.original.userEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className="capitalize">{formatStatusLabel(row.original.status)}</span>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }) => row.original.itemCount,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) =>
        formatMoney(row.original.totalAmount, row.original.currency),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
          <Link to={`/orders/${row.original.id}`}>View</Link>
        </Button>
      ),
    },
  ];

  const table = useTable({
    features,
    data: items,
    columns,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={filters.page}
        limit={filters.limit}
        total={total}
        onPageChange={(page) => onFiltersChange({ ...filters, page })}
      />
    </div>
  );
}
