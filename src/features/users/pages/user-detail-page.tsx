import { Link, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useUserDetailQuery } from '@/features/users/hooks/use-users';
import { useRolesListQuery } from '@/features/users/hooks/use-roles';
import {
  formatUserPhone,
  formatUserRole,
  userDisplayName,
} from '@/features/users/lib/display-name';
import { useAuth } from '@/lib/auth/auth-context';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import { formatDateTime } from '@/lib/format';
import { QueryLoading } from '@/components/feedback/query-state';

export function UserDetailPage() {
  const { hasPermission } = useAuth();
  const canViewOrders = hasPermission('view_all_orders');
  const params = useParams();
  const userId = Number(params.userId);
  const validId = Number.isInteger(userId) && userId > 0;
  const detailQuery = useUserDetailQuery(validId ? userId : undefined);
  const rolesQuery = useRolesListQuery();

  if (!validId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid user</AlertTitle>
        <AlertDescription>
          The user id in the URL is not valid.
        </AlertDescription>
      </Alert>
    );
  }

  if (detailQuery.isLoading) {
    return <QueryLoading>Loading user…</QueryLoading>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load user</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>
            {detailQuery.error instanceof ApiRequestError
              ? detailQuery.error.message
              : 'User not found'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const user = detailQuery.data;
  const roleName = rolesQuery.data?.find(
    (role) => role.code === user.roleCode,
  )?.name;

  return (
    <div className="space-y-8">
      <PageHeader title={userDisplayName(user)} description={user.email}>
        <div className="flex flex-wrap gap-2">
          {canViewOrders ? (
            <Button asChild variant="secondary">
              <Link to={`/orders?userId=${user.id}`}>View orders</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link to="/users">Back to list</Link>
          </Button>
        </div>
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="text-sm font-medium">{user.email}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Phone</dt>
          <dd className="text-sm">{formatUserPhone(user.phone)}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Role</dt>
          <dd className="text-sm font-medium">
            {formatUserRole(user.roleCode, roleName)}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Status</dt>
          <dd className="text-sm font-medium">
            {user.isActive ? 'Active' : 'Inactive'}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Addresses</dt>
          <dd className="text-sm">{user.addressCount}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Created</dt>
          <dd className="text-sm">{formatDateTime(user.createdAt)}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Updated</dt>
          <dd className="text-sm">{formatDateTime(user.updatedAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
