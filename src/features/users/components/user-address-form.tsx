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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import {
  addressFormSchema,
  emptyAddressFormValues,
  type AddressFormValues,
} from '@/features/users/schemas/address-schema';
import { applyApiFormErrors } from '@/lib/api/form-api-errors';
import { isOptimisticLockConflict } from '@/lib/api/parse-api-error';

type UserAddressFormProps = {
  mode: 'add' | 'edit';
  open: boolean;
  isPending: boolean;
  defaultValues?: AddressFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddressFormValues) => Promise<void>;
};

function matchAddressField(
  message: string,
): keyof AddressFormValues | null {
  const lower = message.toLowerCase();
  if (lower.includes('street2') || lower.includes('line 2')) return 'street2';
  if (lower.includes('street')) return 'street';
  if (lower.includes('city')) return 'city';
  if (lower.includes('state') || lower.includes('province')) return 'state';
  if (lower.includes('postal') || lower.includes('zip')) return 'postalCode';
  if (lower.includes('country')) return 'country';
  if (lower.includes('instruction')) return 'deliveryInstructions';
  return null;
}

export function UserAddressForm({
  mode,
  open,
  isPending,
  defaultValues,
  onOpenChange,
  onSubmit,
}: UserAddressFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: defaultValues ?? emptyAddressFormValues,
  });

  async function handleSubmit(values: AddressFormValues) {
    setFormError(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      if (isOptimisticLockConflict(error)) {
        setFormError('This record changed. Close and try again.');
        return;
      }
      applyApiFormErrors({
        error,
        setFormError,
        setFieldError: (name, message) => form.setError(name, { message }),
        matchField: matchAddressField,
      });
    }
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
          <DialogTitle>
            {mode === 'add' ? 'Add address' : 'Edit address'}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => handleSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="address-street">Street</Label>
            <Input id="address-street" {...form.register('street')} />
            {form.formState.errors.street ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.street.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-street2">Street line 2</Label>
            <Input id="address-street2" {...form.register('street2')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address-city">City</Label>
              <Input id="address-city" {...form.register('city')} />
              {form.formState.errors.city ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.city.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-state">State</Label>
              <Input id="address-state" {...form.register('state')} />
              {form.formState.errors.state ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.state.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address-postal">Postal code</Label>
              <Input id="address-postal" {...form.register('postalCode')} />
              {form.formState.errors.postalCode ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.postalCode.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-country">Country</Label>
              <Input id="address-country" {...form.register('country')} />
              {form.formState.errors.country ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.country.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address-instructions">Delivery instructions</Label>
            <Input
              id="address-instructions"
              {...form.register('deliveryInstructions')}
            />
          </div>
          {mode === 'add' ? (
            <div className="flex items-center gap-2">
              <input
                id="address-default"
                type="checkbox"
                className="size-4 rounded border border-input"
                {...form.register('isDefault')}
              />
              <Label htmlFor="address-default" className="font-normal">
                Set as default address
              </Label>
            </div>
          ) : null}
          <ActionErrorAlert
            title="Could not save address"
            message={formError}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving…'
                : mode === 'add'
                  ? 'Add address'
                  : 'Save address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
