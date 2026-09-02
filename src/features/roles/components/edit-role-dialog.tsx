import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  PermissionCheckboxList,
  RoleNameField,
} from '@/features/roles/components/role-form-fields';
import {
  toUpdateRoleDto,
  updateRoleSchema,
  type UpdateRoleFormValues,
} from '@/features/roles/schemas/role-form.schema';
import { usePermissionsListQuery } from '@/features/roles/hooks/use-roles';
import type { RoleResponseDto } from '@/features/roles/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import { QueryLoading } from '@/components/feedback/query-state';

type EditRoleDialogProps = {
  role: RoleResponseDto | null;
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpdateRoleFormValues) => Promise<void>;
};

export function EditRoleDialog({
  role,
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: EditRoleDialogProps) {
  const permissionsQuery = usePermissionsListQuery(open);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { name: '', permissions: [] },
  });

  useEffect(() => {
    if (role && open) {
      form.reset({
        name: role.name,
        permissions: role.permissions.codes,
      });
      setErrorMessage(null);
    }
  }, [role, open, form]);

  async function handleSubmit(values: UpdateRoleFormValues) {
    setErrorMessage(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : 'Failed to update role',
      );
    }
  }

  if (!role) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit role
            {role.isSystem ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                System
              </span>
            ) : null}
          </DialogTitle>
        </DialogHeader>
        {permissionsQuery.isLoading ? (
          <QueryLoading>Loading permissions…</QueryLoading>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => handleSubmit(values))}
          >
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Code</p>
              <p className="font-mono font-medium">{role.code}</p>
            </div>
            <RoleNameField
              id="edit-role-name"
              value={form.watch('name')}
              onChange={(value) =>
                form.setValue('name', value, { shouldValidate: true })
              }
              readOnly={role.isSystem}
              error={form.formState.errors.name?.message}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Permissions</p>
              <PermissionCheckboxList
                permissions={permissionsQuery.data ?? []}
                selected={form.watch('permissions')}
                onChange={(codes) =>
                  form.setValue('permissions', codes, { shouldValidate: true })
                }
              />
              {form.formState.errors.permissions ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.permissions.message}
                </p>
              ) : null}
            </div>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertTitle>Could not update role</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { toUpdateRoleDto };
