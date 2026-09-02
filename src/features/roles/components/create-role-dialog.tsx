import { useState } from 'react';
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
import {
  PermissionCheckboxList,
  RoleCodeField,
  RoleNameField,
} from '@/features/roles/components/role-form-fields';
import {
  createRoleSchema,
  toCreateRoleDto,
  type CreateRoleFormValues,
} from '@/features/roles/schemas/role-form.schema';
import { usePermissionsListQuery } from '@/features/roles/hooks/use-roles';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import { QueryLoading } from '@/components/feedback/query-state';

type CreateRoleDialogProps = {
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateRoleFormValues) => Promise<void>;
};

export function CreateRoleDialog({
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: CreateRoleDialogProps) {
  const permissionsQuery = usePermissionsListQuery(open);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { code: '', name: '', permissions: [] },
  });

  async function handleSubmit(values: CreateRoleFormValues) {
    setErrorMessage(null);
    try {
      await onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create role'));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
          if (!next) {
            setErrorMessage(null);
            form.reset();
          }
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
        </DialogHeader>
        {permissionsQuery.isLoading ? (
          <QueryLoading>Loading permissions…</QueryLoading>
        ) : (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => handleSubmit(values))}
          >
            <RoleCodeField
              value={form.watch('code')}
              onChange={(value) =>
                form.setValue('code', value, { shouldValidate: true })
              }
              error={form.formState.errors.code?.message}
            />
            <RoleNameField
              id="create-role-name"
              value={form.watch('name')}
              onChange={(value) =>
                form.setValue('name', value, { shouldValidate: true })
              }
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
            <ActionErrorAlert
              title="Could not create role"
              message={errorMessage}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create role'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { toCreateRoleDto };
