import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  toUpdateUserDto,
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/features/users/schemas/user-schema';

type UserEditFormProps = {
  defaultValues: UpdateUserFormValues;
  isPending: boolean;
  onSubmit: (values: UpdateUserFormValues) => Promise<void>;
};

export function UserEditForm({
  defaultValues,
  isPending,
  onSubmit,
}: UserEditFormProps) {
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues,
  });

  return (
    <form
      className="max-w-xl space-y-4 rounded-lg border p-6"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input id="firstName" {...form.register('firstName')} />
        {form.formState.errors.firstName ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.firstName.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input id="lastName" {...form.register('lastName')} />
        {form.formState.errors.lastName ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.lastName.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register('email')} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...form.register('phone')} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}

export { toUpdateUserDto };
