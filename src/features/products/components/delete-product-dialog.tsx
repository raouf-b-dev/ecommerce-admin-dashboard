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

type DeleteProductDialogProps = {
  open: boolean;
  productName: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function DeleteProductDialog({
  open,
  productName,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteProductDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setErrorMessage(null);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to delete product'));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            setErrorMessage(null);
          }
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Permanently remove “{productName}” from the catalog. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <ActionErrorAlert
          title="Could not delete product"
          message={errorMessage}
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
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void handleConfirm()}
          >
            {isPending ? 'Deleting…' : 'Delete product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
