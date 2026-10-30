import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  flexRender,
  tableFeatures,
  useTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { SortableTableHead } from '@/components/ui/sortable-table-head';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { TableEmptyState } from '@/components/feedback/table-empty-state';
import { formatDateTime, formatMoney, formatOptionalText } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import type {
  ListOrdersQuery,
  OrderListFilters,
  OrderListItemResponseDto,
} from '@/features/orders/types';

type OrdersTableProps = {
  items: OrderListItemResponseDto[];
  total: number;
  filters: OrderListFilters;
  hasActiveFilters: boolean;
  onFiltersChange: (next: OrderListFilters) => void;
};

const features = tableFeatures({});

type OrderSortBy = NonNullable<ListOrdersQuery['sortBy']>;

export function OrdersTable({
  items,
  total,
  filters,
  hasActiveFilters,
  onFiltersChange,
}: OrdersTableProps) {
  function handleSortChange(sortBy: OrderSortBy, sortOrder: 'asc' | 'desc') {
    onFiltersChange({ ...filters, page: 1, sortBy, sortOrder });
  }

  const columns: ColumnDef<typeof features, OrderListItemResponseDto>[] =
    useMemo(
      () => [
        {
          accessorKey: 'orderNumber',
          header: 'Order',
          cell: ({ row }) => (
            <div className="whitespace-nowrap font-medium">
              {row.original.orderNumber}
            </div>
          ),
        },
        {
          id: 'customer',
          header: 'Customer',
          cell: ({ row }) => (
            <div className="min-w-[10rem] max-w-[14rem]">
              <div className="truncate">
                {formatOptionalText(row.original.userName)}
              </div>
              <div className="truncate text-muted-foreground">
                {formatOptionalText(row.original.userEmail)}
              </div>
            </div>
          ),
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <StatusBadge
              className="shrink-0 whitespace-nowrap"
              variant="order"
              status={row.original.status}
            />
          ),
        },
        {
          accessorKey: 'itemCount',
          header: 'Items',
          cell: ({ row }) => (
            <span className="whitespace-nowrap tabular-nums">
              {row.original.itemCount}
            </span>
          ),
        },
        {
          accessorKey: 'totalAmount',
          header: 'Total',
          cell: ({ row }) => (
            <span className="whitespace-nowrap tabular-nums">
              {formatMoney(row.original.totalAmount, row.original.currency)}
            </span>
          ),
        },
        {
          accessorKey: 'createdAt',
          header: 'Created',
          cell: ({ row }) => (
            <span className="whitespace-nowrap">
              {formatDateTime(row.original.createdAt)}
            </span>
          ),
        },
        {
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link to={`/orders/${row.original.id}`}>View</Link>
            </Button>
          ),
        },
      ],
      [],
    );

  const table = useTable({
    features,
    data: items,
    columns,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table className="min-w-[44rem]" scrollRegionLabel="Orders">
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <SortableTableHead
                label="Total"
                sortKey="totalPrice"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <SortableTableHead
                label="Created"
                sortKey="createdAt"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <TableHead />
            </TableRow>
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
                <TableCell colSpan={columns.length} className="h-auto py-4">
                  <TableEmptyState
                    title={
                      hasActiveFilters
                        ? 'No orders match your filters.'
                        : 'No orders found.'
                    }
                    description={
                      hasActiveFilters
                        ? 'Try clearing filters or broadening your search.'
                        : 'Orders appear here after customers check out on the storefront.'
                    }
                  />
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
