import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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

export function UserDetailPage() {
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
          <dt className="text-sm text-muted-foreground">Created</dt>
          <dd className="text-sm">{formatDateTime(user.createdAt)}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Updated</dt>
          <dd className="text-sm">{formatDateTime(user.updatedAt)}</dd>
        </div>
      </dl>

      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Addresses</h2>
            <p className="text-sm text-muted-foreground">
              Saved addresses for this account.
            </p>
          </div>
          {canManageUsers ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingAddress(null);
                setAddressFormMode('add');
              }}
            >
              Add address
            </Button>
          ) : null}
        </div>
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
      </section>

      {canManageUsers ? (
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Operator actions</h2>
            <p className="text-sm text-muted-foreground">
              Update profile fields or change account status.
            </p>
          </div>
          {saveMessage ? (
            <Alert>
              <AlertTitle>Saved</AlertTitle>
              <AlertDescription>{saveMessage}</AlertDescription>
            </Alert>
          ) : null}
          {editDefaults ? (
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
          ) : null}
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
        </section>
      ) : null}

      {canManageRoles ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Assigned role</h2>
            <p className="text-sm text-muted-foreground">
              Replace this user's role. The API enforces who may assign roles.
            </p>
          </div>
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
        </section>
      ) : null}
    </div>
  );
}
