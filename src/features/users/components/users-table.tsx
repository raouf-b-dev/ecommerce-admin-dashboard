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
import {
  formatUserPhone,
  formatUserRole,
  userDisplayName,
} from '@/features/users/lib/display-name';
import type {
  UserListFilters,
  UserListItemResponseDto,
} from '@/features/users/types';

type UsersTableProps = {
  items: UserListItemResponseDto[];
  total: number;
  filters: UserListFilters;
  roleNamesByCode?: Record<string, string>;
  onFiltersChange: (next: UserListFilters) => void;
};

const features = tableFeatures({});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function UsersTable({
  items,
  total,
  filters,
  roleNamesByCode,
  onFiltersChange,
}: UsersTableProps) {
  const columns: ColumnDef<typeof features, UserListItemResponseDto>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium">{userDisplayName(row.original)}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email,
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: ({ row }) => formatUserPhone(row.original.phone),
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) =>
        formatUserRole(
          row.original.roleCode,
          row.original.roleCode
            ? roleNamesByCode?.[row.original.roleCode]
            : undefined,
        ),
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
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm">
          <Link to={`/users/${row.original.id}`}>View</Link>
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
                  No users found.
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
