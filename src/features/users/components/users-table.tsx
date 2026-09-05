import { useMemo } from 'react';
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
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/format';
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

export function UsersTable({
  items,
  total,
  filters,
  roleNamesByCode,
  onFiltersChange,
}: UsersTableProps) {
  const columns = useMemo<ColumnDef<typeof features, UserListItemResponseDto>[]>(
    () => [
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
      cell: ({ row }) => (
        <StatusBadge variant="user" isActive={row.original.isActive} />
      ),
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
          <Link to={`/users/${row.original.id}`}>View</Link>
        </Button>
      ),
    },
  ], [roleNamesByCode]);

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
                  No users found.
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
