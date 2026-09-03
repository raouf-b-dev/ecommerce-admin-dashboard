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
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      {open ? (
        <CreateRoleDialogBody
          isPending={isPending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

function CreateRoleDialogBody({
  isPending,
  onOpenChange,
  onSubmit,
}: Omit<CreateRoleDialogProps, 'open'>) {
  const permissionsQuery = usePermissionsListQuery(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: { code: '', name: '', permissions: [] },
  });

  async function handleSubmit(values: CreateRoleFormValues) {
    setErrorMessage(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create role'));
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create role</DialogTitle>
        <DialogDescription>
          Define a new role code, display name, and permission set.
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
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RoleCodeField
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RoleNameField
                      id="create-role-name"
                      value={field.value}
                      onChange={field.onChange}
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
              title="Could not create role"
              message={errorMessage}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  );
}

export { toCreateRoleDto };
