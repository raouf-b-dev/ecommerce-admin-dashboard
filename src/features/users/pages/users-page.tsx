import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UsersTable } from '@/features/users/components/users-table';
import { useUsersListQuery } from '@/features/users/hooks/use-users';
import {
  userListFiltersFromSearchParams,
  userListFiltersToSearchParams,
} from '@/features/users/lib/user-list-filters';
import type { UserListFilters, UserRoleCode } from '@/features/users/types';

type ActiveFilter = '' | 'true' | 'false';
type RoleFilter = '' | UserRoleCode;

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super admin' },
];

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = userListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useUsersListQuery(filters);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? '');

  function updateFilters(next: UserListFilters) {
    setSearchParams(userListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: FormEvent) {
    event.preventDefault();
    updateFilters({
      ...filters,
      page: 1,
      search: searchDraft.trim() || undefined,
    });
  }

  const activeValue: ActiveFilter =
    filters.isActive === true
      ? 'true'
      : filters.isActive === false
        ? 'false'
        : '';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Browse accounts and open user details."
      />

      <div className="flex flex-wrap items-end gap-4">
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={applyTextFilters}
        >
          <div className="space-y-2">
            <Label htmlFor="users-search">Search</Label>
            <Input
              id="users-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name or email"
              className="w-56"
            />
          </div>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>

        <div className="space-y-2">
          <Label htmlFor="users-status">Status</Label>
          <select
            id="users-status"
            className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={activeValue}
            onChange={(e) => {
              const value = e.target.value as ActiveFilter;
              updateFilters({
                ...filters,
                page: 1,
                isActive:
                  value === 'true'
                    ? true
                    : value === 'false'
                      ? false
                      : undefined,
              });
            }}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="users-role">Role</Label>
          <select
            id="users-role"
            className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.roleCode ?? ''}
            onChange={(e) => {
              const value = e.target.value as RoleFilter;
              updateFilters({
                ...filters,
                page: 1,
                roleCode: value === '' ? undefined : value,
              });
            }}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError && !data ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load users</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {error instanceof Error ? error.message : 'Unexpected error'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {isError && data ? (
        <Alert>
          <AlertTitle>Could not refresh users</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {error instanceof Error
                ? error.message
                : 'Showing the last loaded results.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users…</p>
      ) : data ? (
        <div
          className={isFetching ? 'opacity-70 transition-opacity' : undefined}
        >
          <UsersTable
            items={data.items}
            total={data.total}
            filters={filters}
            onFiltersChange={updateFilters}
          />
        </div>
      ) : null}
    </div>
  );
}
