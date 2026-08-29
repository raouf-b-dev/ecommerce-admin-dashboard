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
import type {
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

function formatPrice(price: number, currency?: string | null) {
  if (!currency?.trim()) {
    return String(price);
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
}

function nullableString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  return '—';
}

export function ProductsTable({
  items,
  total,
  filters,
  canManage,
  onFiltersChange,
}: ProductsTableProps) {
  const columns: ColumnDef<typeof features, ProductListItemResponseDto>[] = [
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
      cell: ({ row }) => formatPrice(row.original.price, row.original.currency),
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
  ];

  const table = useTable({
    features,
    data: items,
    columns,
  });

  const totalPages = Math.max(1, Math.ceil(total / filters.limit));
  const canPrev = filters.page > 1;
  const canNext = filters.page < totalPages;

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
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          Page {filters.page} of {totalPages} · {total} total
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() =>
              onFiltersChange({ ...filters, page: filters.page - 1 })
            }
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() =>
              onFiltersChange({ ...filters, page: filters.page + 1 })
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
