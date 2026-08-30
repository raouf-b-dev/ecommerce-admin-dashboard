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
import { formatDateTime } from '@/lib/format';
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
