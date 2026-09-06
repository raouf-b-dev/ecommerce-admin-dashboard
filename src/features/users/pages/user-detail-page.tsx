import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Check, Copy, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { UserAvatar } from '@/features/users/components/user-avatar';
import {
  UserEditForm,
  toUpdateUserDto,
} from '@/features/users/components/user-edit-form';
import { UserStatusActions } from '@/features/users/components/user-status-actions';
import { UserRoleActions } from '@/features/users/components/user-role-actions';
import { UserAddressForm } from '@/features/users/components/user-address-form';
import { UserAddressList } from '@/features/users/components/user-address-list';
import {
  toAddAddressDto,
  toUpdateAddressDto,
  type AddressFormValues,
} from '@/features/users/schemas/address-schema';
import {
  useActivateUser,
  useAddUserAddress,
  useAssignUserRole,
  useDeactivateUser,
  useDeleteUserAddress,
  useSetDefaultUserAddress,
  useUpdateUser,
  useUpdateUserAddress,
  useUserDetailQuery,
} from '@/features/users/hooks/use-users';
import { useRolesListQuery } from '@/features/roles/hooks/use-roles';
import {
  formatUserPhone,
  formatUserRole,
  userDisplayName,
} from '@/features/users/lib/display-name';
import type { AddressResponseDto } from '@/features/users/types';
import { useAuth } from '@/lib/auth/auth-context';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { formatDateTime } from '@/lib/format';
import { QueryLoading } from '@/components/feedback/query-state';

function UserDetailPage() {
  const { hasPermission } = useAuth();
  const canViewOrders = hasPermission('view_all_orders');
  const canManageUsers = hasPermission('manage_users');
  const canManageRoles = hasPermission('manage_roles');
  const params = useParams();
  const userId = Number(params.userId);
  const validId = Number.isInteger(userId) && userId > 0;
  const detailQuery = useUserDetailQuery(validId ? userId : undefined);
  const rolesQuery = useRolesListQuery();
  const updateUser = useUpdateUser(userId);
  const activateUser = useActivateUser(userId);
  const deactivateUser = useDeactivateUser(userId);
  const assignUserRole = useAssignUserRole(userId);
  const addAddress = useAddUserAddress(userId);
  const updateAddress = useUpdateUserAddress(userId);
  const deleteAddress = useDeleteUserAddress(userId);
  const setDefaultAddress = useSetDefaultUserAddress(userId);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [addressFormMode, setAddressFormMode] = useState<'add' | 'edit' | null>(
    null,
  );
  const [editingAddress, setEditingAddress] =
    useState<AddressResponseDto | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const editDefaults = useMemo(() => {
    const user = detailQuery.data;
    if (!user) {
      return undefined;
    }
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
    };
  }, [detailQuery.data]);

  function handleCopyId() {
    if (!detailQuery.data) return;
    navigator.clipboard.writeText(String(detailQuery.data.id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

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
            {getErrorMessage(detailQuery.error, 'User not found')}
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
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3.5">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              size="lg"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {userDisplayName(user)}
                </h1>
                <StatusBadge variant="user" isActive={user.isActive} />
                <span className="inline-flex items-center rounded-full border border-border bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {formatUserRole(user.roleCode, roleName)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{user.email}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <span>ID: #{user.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    aria-label="Copy user ID"
                    className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {copiedId ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canViewOrders ? (
              <Button asChild variant="secondary" size="sm">
                <Link to={`/orders?userId=${user.id}`}>View orders</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link to="/users">Back to list</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Dashboard Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-xl">Profile details</CardTitle>
              <CardDescription>
                {canManageUsers
                  ? 'Update personal and contact information for this account.'
                  : 'Personal and contact information for this account.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {saveMessage ? (
                <Alert className="mb-5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <AlertTitle>Saved</AlertTitle>
                  <AlertDescription>{saveMessage}</AlertDescription>
                </Alert>
              ) : null}

              {canManageUsers && editDefaults ? (
                <UserEditForm
                  key={`${user.id}-${user.updatedAt}`}
                  defaultValues={editDefaults}
                  isPending={updateUser.isPending}
                  onSubmit={async (values) => {
                    setSaveMessage(null);
                    await updateUser.mutateAsync(toUpdateUserDto(values));
                    setSaveMessage('Profile updated.');
                  }}
                />
              ) : (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground">Full name</dt>
                    <dd className="text-sm font-medium">{userDisplayName(user)}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground">Email</dt>
                    <dd className="text-sm font-medium">{user.email}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-xs font-medium text-muted-foreground">Phone</dt>
                    <dd className="text-sm">{formatUserPhone(user.phone)}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Addresses Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle as="h2" className="text-xl">Addresses</CardTitle>
                <CardDescription className="mt-1">
                  Saved shipping and billing locations.
                </CardDescription>
              </div>
              {canManageUsers ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddressFormMode('add');
                  }}
                  className="gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add address
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <UserAddressList
                addresses={user.addresses ?? []}
                canManage={canManageUsers}
                isPending={
                  addAddress.isPending ||
                  updateAddress.isPending ||
                  deleteAddress.isPending ||
                  setDefaultAddress.isPending
                }
                onEdit={(address) => {
                  setEditingAddress(address);
                  setAddressFormMode('edit');
                }}
                onDelete={async (addressId) => {
                  await deleteAddress.mutateAsync(addressId);
                }}
                onSetDefault={async (addressId) => {
                  await setDefaultAddress.mutateAsync(addressId);
                }}
              />
              {addressFormMode !== null ? (
                <UserAddressForm
                  mode={addressFormMode}
                  open
                  isPending={addAddress.isPending || updateAddress.isPending}
                  defaultValues={
                    editingAddress
                      ? {
                          street: editingAddress.street,
                          street2: editingAddress.street2 ?? '',
                          city: editingAddress.city,
                          state: editingAddress.state,
                          postalCode: editingAddress.postalCode,
                          country: editingAddress.country,
                          deliveryInstructions:
                            editingAddress.deliveryInstructions ?? '',
                          isDefault: editingAddress.isDefault,
                        }
                      : undefined
                  }
                  onOpenChange={(open) => {
                    if (!open) {
                      setAddressFormMode(null);
                      setEditingAddress(null);
                    }
                  }}
                  onSubmit={async (values: AddressFormValues) => {
                    if (addressFormMode === 'edit' && editingAddress) {
                      await updateAddress.mutateAsync({
                        addressId: editingAddress.id,
                        body: toUpdateAddressDto(values),
                      });
                      return;
                    }
                    await addAddress.mutateAsync(toAddAddressDto(values));
                  }}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-6">
          {/* Account Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account overview</CardTitle>
              <CardDescription>
                System timestamps and identifiers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">User ID</dt>
                  <dd className="font-mono text-xs font-semibold text-foreground">#{user.id}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Registered</dt>
                  <dd className="text-xs font-medium text-foreground">
                    {formatDateTime(user.createdAt)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Last updated</dt>
                  <dd className="text-xs font-medium text-foreground">
                    {formatDateTime(user.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Assigned Role Card (Only if canManageRoles) */}
          {canManageRoles ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assigned role</CardTitle>
                <CardDescription>
                  Replace this user's role. Changes take effect on next sign in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserRoleActions
                  key={`${user.id}-${user.roleCode ?? ''}`}
                  currentRoleCode={user.roleCode ?? null}
                  roles={rolesQuery.data ?? []}
                  rolesLoading={rolesQuery.isLoading}
                  isPending={assignUserRole.isPending}
                  onAssign={async (roleCode) => {
                    await assignUserRole.mutateAsync({ roleCode });
                  }}
                />
              </CardContent>
            </Card>
          ) : null}

          {/* Danger Zone Card (Only if canManageUsers) */}
          {canManageUsers ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Actions that affect this user's account access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {user.isActive
                    ? 'Deactivating this user will revoke their session and prevent them from signing in.'
                    : 'Reactivating this user will restore their sign-in capability and account access.'}
                </p>
                <UserStatusActions
                  isActive={user.isActive}
                  isPending={activateUser.isPending || deactivateUser.isPending}
                  onActivate={async () => {
                    await activateUser.mutateAsync();
                  }}
                  onDeactivate={async () => {
                    await deactivateUser.mutateAsync();
                  }}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { UserDetailPage };
export default UserDetailPage;
