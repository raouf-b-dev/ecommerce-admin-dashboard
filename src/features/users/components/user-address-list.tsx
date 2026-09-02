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
        <p className="text-sm text-muted-foreground">No addresses on file.</p>
        <ActionErrorAlert message={errorMessage} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="space-y-3 rounded-lg border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{address.street}</p>
                {address.street2 ? <p>{address.street2}</p> : null}
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
                {address.deliveryInstructions ? (
                  <p className="text-muted-foreground">
                    {address.deliveryInstructions}
                  </p>
                ) : null}
              </div>
              {address.isDefault ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
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
