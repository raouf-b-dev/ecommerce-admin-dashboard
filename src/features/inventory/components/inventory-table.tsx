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
  InventoryListFilters,
  InventoryListItemResponseDto,
} from '@/features/inventory/types';

type InventoryTableProps = {
  items: InventoryListItemResponseDto[];
  total: number;
  filters: InventoryListFilters;
  onFiltersChange: (next: InventoryListFilters) => void;
};

const features = tableFeatures({});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function InventoryTable({
  items,
  total,
  filters,
  onFiltersChange,
}: InventoryTableProps) {
  const columns: ColumnDef<typeof features, InventoryListItemResponseDto>[] = [
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
      cell: ({ row }) => row.original.availableQuantity,
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
      cell: ({ row }) => formatDate(row.original.updatedAt),
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
                  No inventory found.
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
