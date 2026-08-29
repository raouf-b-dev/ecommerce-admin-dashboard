import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  ORDER_STATUS_ACTION_LABELS,
  parseAllowedOrderActions,
} from '@/features/orders/lib/order-status-actions';
import type { OrderStatusAction } from '@/features/orders/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';

type OrderStatusActionsProps = {
  allowedActions: readonly string[];
  isPending: boolean;
  onAction: (action: OrderStatusAction) => Promise<void>;
};

const CONFIRM_REQUIRED: OrderStatusAction[] = ['cancel', 'deliver'];

export function OrderStatusActions({
  allowedActions,
  isPending,
  onAction,
}: OrderStatusActionsProps) {
  const allowed = parseAllowedOrderActions(allowedActions);
  const [confirmAction, setConfirmAction] = useState<OrderStatusAction | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function runAction(action: OrderStatusAction) {
    setErrorMessage(null);
    try {
      await onAction(action);
      setConfirmAction(null);
    } catch (error) {
      setErrorMessage(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : `Failed to ${action} order`,
      );
    }
  }

  function handleClick(action: OrderStatusAction) {
    if (CONFIRM_REQUIRED.includes(action)) {
      setConfirmAction(action);
      return;
    }
    void runAction(action);
  }

  if (allowed.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No status actions available for this order.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {allowed.map((action) => (
          <Button
            key={action}
            type="button"
            variant={action === 'cancel' ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={() => handleClick(action)}
          >
            {ORDER_STATUS_ACTION_LABELS[action]}
          </Button>
        ))}
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction
                ? `${ORDER_STATUS_ACTION_LABELS[confirmAction]} order?`
                : 'Confirm'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'cancel'
                ? 'Cancelling cannot be undone from the admin console.'
                : 'Mark this order as delivered?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmAction(null)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant={confirmAction === 'cancel' ? 'destructive' : 'default'}
              disabled={isPending || !confirmAction}
              onClick={() => {
                if (confirmAction) {
                  void runAction(confirmAction);
                }
              }}
            >
              {confirmAction
                ? ORDER_STATUS_ACTION_LABELS[confirmAction]
                : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
