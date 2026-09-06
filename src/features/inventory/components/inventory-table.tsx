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
import { formatDateTime } from '@/lib/format';
import { StatusBadge } from '@/components/ui/status-badge';
import type {
  InventoryListFilters,
  InventoryListItemResponseDto,
  ListInventoryQuery,
} from '@/features/inventory/types';

type InventoryTableProps = {
  items: InventoryListItemResponseDto[];
  total: number;
  filters: InventoryListFilters;
  onFiltersChange: (next: InventoryListFilters) => void;
};

const features = tableFeatures({});

type InventorySortBy = NonNullable<ListInventoryQuery['sortBy']>;

export function InventoryTable({
  items,
  total,
  filters,
  onFiltersChange,
}: InventoryTableProps) {
  function handleSortChange(
    sortBy: InventorySortBy,
    sortOrder: 'asc' | 'desc',
  ) {
    onFiltersChange({ ...filters, page: 1, sortBy, sortOrder });
  }

  const columns: ColumnDef<typeof features, InventoryListItemResponseDto>[] =
    useMemo(
      () => [
        {
          accessorKey: 'sku',
          header: 'SKU',
          cell: ({ row }) => (
            <div className="font-medium">{row.original.sku}</div>
          ),
        },
        {
          accessorKey: 'productTitle',
          header: 'Product',
          cell: ({ row }) => row.original.productTitle,
        },
        {
          accessorKey: 'availableQuantity',
          header: 'Available',
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <span className="tabular-nums font-medium">
                {row.original.availableQuantity}
              </span>
              {row.original.availableQuantity <= 0 ? (
                <StatusBadge variant="inventory" status="critical" />
              ) : null}
            </div>
          ),
        },
        {
          accessorKey: 'reservedQuantity',
          header: 'Reserved',
          cell: ({ row }) => row.original.reservedQuantity,
        },
        {
          accessorKey: 'totalQuantity',
          header: 'Total',
          cell: ({ row }) => row.original.totalQuantity,
        },
        {
          accessorKey: 'updatedAt',
          header: 'Updated',
          cell: ({ row }) => formatDateTime(row.original.updatedAt),
        },
        {
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <Button asChild variant="outline" size="sm">
              <Link to={`/inventory/${row.original.productId}`}>View</Link>
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <SortableTableHead
                label="Available"
                sortKey="availableQuantity"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <TableHead>Reserved</TableHead>
              <SortableTableHead
                label="Total"
                sortKey="totalQuantity"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <SortableTableHead
                label="Updated"
                sortKey="updatedAt"
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No inventory found.
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
