import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  CreateRoleDialog,
  toCreateRoleDto,
} from '@/features/roles/components/create-role-dialog';
import {
  EditRoleDialog,
  toUpdateRoleDto,
} from '@/features/roles/components/edit-role-dialog';
import {
  useCreateRole,
  useDeleteRole,
  useRolesListQuery,
  useUpdateRole,
} from '@/features/roles/hooks/use-roles';
import type { RoleResponseDto } from '@/features/roles/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import { QueryLoading } from '@/components/feedback/query-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function RolesTable() {
  const rolesQuery = useRolesListQuery();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleResponseDto | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const updateRole = useUpdateRole();

  if (rolesQuery.isLoading) {
    return <QueryLoading>Loading roles…</QueryLoading>;
  }

  if (rolesQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load roles</AlertTitle>
        <AlertDescription>
          {rolesQuery.error instanceof ApiRequestError
            ? rolesQuery.error.message
            : 'Failed to load roles'}
        </AlertDescription>
      </Alert>
    );
  }

  const roles = rolesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Create role
        </Button>
      </div>
      {actionError ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      ) : null}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono">
                    <div className="flex items-center gap-2">
                      {role.code}
                      {role.isSystem ? (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          System
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.permissions.codes.length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditRole(role)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={role.isSystem}
                        onClick={() => setDeleteTarget(role)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CreateRoleDialog
        open={createOpen}
        isPending={createRole.isPending}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          setActionError(null);
          await createRole.mutateAsync(toCreateRoleDto(values));
        }}
      />
      <EditRoleDialog
        role={editRole}
        open={editRole !== null}
        isPending={updateRole.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditRole(null);
          }
        }}
        onSubmit={async (values) => {
          if (!editRole) {
            return;
          }
          setActionError(null);
          await updateRole.mutateAsync({
            id: editRole.id,
            body: toUpdateRoleDto(values),
          });
          setEditRole(null);
        }}
      />
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              Permanently delete “{deleteTarget?.name}”. Users assigned this role
              may lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteRole.isPending}
              onClick={async () => {
                if (!deleteTarget) {
                  return;
                }
                setActionError(null);
                try {
                  await deleteRole.mutateAsync(deleteTarget.id);
                  setDeleteTarget(null);
                } catch (error) {
                  setActionError(
                    error instanceof ApiRequestError
                      ? error.message
                      : 'Failed to delete role',
                  );
                }
              }}
            >
              {deleteRole.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
