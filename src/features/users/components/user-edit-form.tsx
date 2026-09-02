import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  toUpdateUserDto,
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/features/users/schemas/user-schema';
import { applyApiFormErrors } from '@/lib/api/form-api-errors';

type UserEditFormProps = {
  defaultValues: UpdateUserFormValues;
  isPending: boolean;
  onSubmit: (values: UpdateUserFormValues) => Promise<void>;
};

function matchUserField(message: string): keyof UpdateUserFormValues | null {
  const lower = message.toLowerCase();
  if (lower.includes('first') && lower.includes('name')) return 'firstName';
  if (lower.includes('last') && lower.includes('name')) return 'lastName';
  if (lower.includes('firstname')) return 'firstName';
  if (lower.includes('lastname')) return 'lastName';
  if (lower.includes('email')) return 'email';
  if (lower.includes('phone')) return 'phone';
  return null;
}

export function UserEditForm({
  defaultValues,
  isPending,
  onSubmit,
}: UserEditFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues,
  });

  async function handleSubmit(values: UpdateUserFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      applyApiFormErrors({
        error,
        setFormError,
        setFieldError: (name, message) => form.setError(name, { message }),
        matchField: matchUserField,
      });
    }
  }

  return (
    <form
      className="max-w-xl space-y-4 rounded-lg border p-6"
      onSubmit={form.handleSubmit((values) => handleSubmit(values))}
    >
      {formError ? (
        <Alert variant="destructive" aria-live="polite">
          <AlertTitle>Could not save profile</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
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
        {form.formState.errors.phone ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.phone.message}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}

export { toUpdateUserDto };
