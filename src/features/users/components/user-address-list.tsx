import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';
import type { AddressResponseDto } from '@/features/users/types';

type UserAddressListProps = {
  addresses: AddressResponseDto[];
  canManage: boolean;
  isPending: boolean;
  onEdit: (address: AddressResponseDto) => void;
  onDelete: (addressId: number) => Promise<void>;
  onSetDefault: (addressId: number) => Promise<void>;
};

export function UserAddressList({
  addresses,
  canManage,
  isPending,
  onEdit,
  onDelete,
  onSetDefault,
}: UserAddressListProps) {
  const [deleteTarget, setDeleteTarget] = useState<AddressResponseDto | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runDelete() {
    if (!deleteTarget) {
      return;
    }
    setErrorMessage(null);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to delete address'));
    }
  }

  async function runSetDefault(addressId: number) {
    setErrorMessage(null);
    try {
      await onSetDefault(addressId);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to set default address'));
    }
  }

  if (addresses.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-muted-foreground">No addresses on file.</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Shipping and billing addresses will appear here once added.
          </p>
        </div>
        <ActionErrorAlert message={errorMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="grid gap-3 sm:grid-cols-1">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="space-y-3 rounded-lg border border-border bg-card/60 p-4 transition-colors hover:border-border/90"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-foreground">{address.street}</p>
                {address.street2 ? <p className="text-muted-foreground">{address.street2}</p> : null}
                <p className="text-muted-foreground">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-muted-foreground">{address.country}</p>
                {address.deliveryInstructions ? (
                  <p className="mt-1 text-xs italic text-muted-foreground/90">
                    Instructions: {address.deliveryInstructions}
                  </p>
                ) : null}
              </div>
              {address.isDefault ? (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                  Default
                </span>
              ) : null}
            </div>
            {canManage ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => onEdit(address)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isPending || address.isDefault}
                  onClick={() => void runSetDefault(address.id)}
                >
                  Set default
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={() => {
                    setErrorMessage(null);
                    setDeleteTarget(address);
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <ActionErrorAlert message={errorMessage} />
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
            <DialogTitle>Delete address</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Remove ${deleteTarget.street} from this account?`
                : 'Remove this address from the account?'}
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
              disabled={isPending}
              onClick={() => void runDelete()}
            >
              {isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
