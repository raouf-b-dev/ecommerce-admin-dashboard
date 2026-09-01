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
import { formatDate, formatMoney } from '@/lib/format';
import type {
  ListProductsQuery,
  ProductListFilters,
  ProductListItemResponseDto,
} from '@/features/products/types';

type ProductsTableProps = {
  items: ProductListItemResponseDto[];
  total: number;
  filters: ProductListFilters;
  canManage: boolean;
  onFiltersChange: (next: ProductListFilters) => void;
};

const features = tableFeatures({});

function nullableString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return '—';
}

type ProductSortBy = NonNullable<ListProductsQuery['sortBy']>;

export function ProductsTable({
  items,
  total,
  filters,
  canManage,
  onFiltersChange,
}: ProductsTableProps) {
  function handleSortChange(sortBy: ProductSortBy, sortOrder: 'asc' | 'desc') {
    onFiltersChange({ ...filters, page: 1, sortBy, sortOrder });
  }

  const columns: ColumnDef<typeof features, ProductListItemResponseDto>[] =
    useMemo(
      () => [
        {
          accessorKey: 'name',
          header: 'Name',
          cell: ({ row }) => (
            <div className="font-medium">{row.original.name}</div>
          ),
        },
        {
          accessorKey: 'sku',
          header: 'SKU',
          cell: ({ row }) => nullableString(row.original.sku),
        },
        {
          accessorKey: 'price',
          header: 'Price',
          cell: ({ row }) =>
            formatMoney(row.original.price, row.original.currency),
        },
        {
          accessorKey: 'isActive',
          header: 'Status',
          cell: ({ row }) => (row.original.isActive ? 'Active' : 'Inactive'),
        },
        {
          accessorKey: 'createdAt',
          header: 'Created',
          cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
          id: 'actions',
          header: '',
          cell: ({ row }) =>
            canManage ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/products/${row.original.id}/edit`}>Edit</Link>
              </Button>
            ) : null,
        },
      ],
      [canManage],
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
              <SortableTableHead
                label="Name"
                sortKey="name"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <TableHead>SKU</TableHead>
              <SortableTableHead
                label="Price"
                sortKey="price"
                activeSortBy={filters.sortBy}
                activeSortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
              />
              <TableHead>Status</TableHead>
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No products found.
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
