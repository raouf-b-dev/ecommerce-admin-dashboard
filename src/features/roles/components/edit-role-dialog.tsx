import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';
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
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      {open && role ? (
        <EditRoleDialogBody
          role={role}
          isPending={isPending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

function EditRoleDialogBody({
  role,
  isPending,
  onOpenChange,
  onSubmit,
}: {
  role: RoleResponseDto;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpdateRoleFormValues) => Promise<void>;
}) {
  const permissionsQuery = usePermissionsListQuery(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role.name,
      permissions: role.permissions.codes,
    },
  });

  async function handleSubmit(values: UpdateRoleFormValues) {
    setErrorMessage(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to update role'));
    }
  }

  return (
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
        <DialogDescription>
          Update the display name and permissions for “{role.code}”.
        </DialogDescription>
      </DialogHeader>
      {permissionsQuery.isLoading ? (
        <QueryLoading>Loading permissions…</QueryLoading>
      ) : (
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => handleSubmit(values))}
          >
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Code</p>
              <p className="font-mono font-medium">{role.code}</p>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RoleNameField
                      id="edit-role-name"
                      value={field.value}
                      onChange={field.onChange}
                      readOnly={role.isSystem}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <FormControl>
                    <PermissionCheckboxList
                      permissions={permissionsQuery.data ?? []}
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ActionErrorAlert
              title="Could not update role"
              message={errorMessage}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  );
}

export { toUpdateRoleDto };
