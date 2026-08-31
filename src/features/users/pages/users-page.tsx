import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  QueryListRegion,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { UsersTable } from '@/features/users/components/users-table';
import { useRolesListQuery } from '@/features/users/hooks/use-roles';
import { useUsersListQuery } from '@/features/users/hooks/use-users';
import {
  userListFiltersFromSearchParams,
  userListFiltersToSearchParams,
} from '@/features/users/lib/user-list-filters';
import type { UserListFilters } from '@/features/users/types';

type ActiveFilter = '' | 'true' | 'false';

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = userListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useUsersListQuery(filters);
  const rolesQuery = useRolesListQuery();

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

  const roleOptions = [...(rolesQuery.data ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const roleNamesByCode = Object.fromEntries(
    roleOptions.map((role) => [role.code, role.name]),
  );

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
            disabled={rolesQuery.isLoading || rolesQuery.isError}
            onChange={(e) => {
              const value = e.target.value;
              updateFilters({
                ...filters,
                page: 1,
                roleCode: value === '' ? undefined : value,
              });
            }}
          >
            <option value="">All roles</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.code}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rolesQuery.isError ? (
        <Alert>
          <AlertTitle>Could not load roles</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {rolesQuery.error instanceof Error
                ? rolesQuery.error.message
                : 'Role filter is unavailable.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => rolesQuery.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <QueryStateAlert
        isError={isError}
        hasData={Boolean(data)}
        error={error}
        onRetry={() => refetch()}
        resource="users"
      />

      <QueryListRegion
        isLoading={isLoading}
        isFetching={isFetching}
        loadingLabel="Loading users…"
        hasData={Boolean(data)}
      >
        {data ? (
          <UsersTable
            items={data.items}
            total={data.total}
            filters={filters}
            roleNamesByCode={roleNamesByCode}
            onFiltersChange={updateFilters}
          />
        ) : null}
      </QueryListRegion>
    </div>
  );
}
