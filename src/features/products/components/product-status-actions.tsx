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

type ProductStatusActionsProps = {
  isActive: boolean;
  isPending: boolean;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
};

export function ProductStatusActions({
  isActive,
  isPending,
  onActivate,
  onDeactivate,
}: ProductStatusActionsProps) {
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runActivate() {
    setErrorMessage(null);
    try {
      await onActivate();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to activate product'));
    }
  }

  async function runDeactivate() {
    setErrorMessage(null);
    try {
      await onDeactivate();
      setConfirmDeactivate(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to deactivate product'));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {isActive ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => setConfirmDeactivate(true)}
          >
            Deactivate product
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => void runActivate()}
          >
            Activate product
          </Button>
        )}
      </div>
      <ActionErrorAlert message={errorMessage} />
      <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate product</DialogTitle>
            <DialogDescription>
              The product will be hidden from the catalog until reactivated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDeactivate(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => void runDeactivate()}
            >
              {isPending ? 'Deactivating…' : 'Deactivate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
