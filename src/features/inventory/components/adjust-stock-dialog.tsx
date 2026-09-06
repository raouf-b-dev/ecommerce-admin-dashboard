import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  adjustStockSchema,
  ADJUST_STOCK_TYPE_OPTIONS,
  toAdjustStockDto,
  type AdjustStockFormValues,
} from '@/features/inventory/schemas/adjust-stock-schema';
import type { AdjustStockDto } from '@/features/inventory/types';
import { applyApiFormErrors } from '@/lib/api/form-api-errors';

type AdjustStockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
  availableQuantity?: number;
  conflictMessage?: string | null;
  onSubmit: (body: AdjustStockDto) => Promise<void>;
};

const emptyDefaults: AdjustStockFormValues = {
  type: 'ADD',
  quantity: '',
  reason: '',
};

export function AdjustStockDialog({
  open,
  onOpenChange,
  productTitle,
  availableQuantity,
  conflictMessage,
  onSubmit,
}: AdjustStockDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <AdjustStockDialogBody
          onOpenChange={onOpenChange}
          productTitle={productTitle}
          availableQuantity={availableQuantity}
          conflictMessage={conflictMessage}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

function AdjustStockDialogBody({
  onOpenChange,
  productTitle,
  availableQuantity,
  conflictMessage,
  onSubmit,
}: Omit<AdjustStockDialogProps, 'open'>) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: emptyDefaults,
  });

  const watchedType = useWatch({ control: form.control, name: 'type' });
  const watchedQuantity = useWatch({ control: form.control, name: 'quantity' });

  const parsedQty = Number(watchedQuantity);
  const isValidQty = Number.isInteger(parsedQty) && parsedQty > 0;
  let computedAvailable: number | null = null;
  let deltaLabel: string | null = null;

  if (availableQuantity !== undefined && isValidQty) {
    if (watchedType === 'ADD') {
      computedAvailable = availableQuantity + parsedQty;
      deltaLabel = `+${parsedQty}`;
    } else if (watchedType === 'SUBTRACT') {
      computedAvailable = Math.max(0, availableQuantity - parsedQty);
      deltaLabel = `-${parsedQty}`;
    } else if (watchedType === 'SET') {
      computedAvailable = parsedQty;
      const diff = parsedQty - availableQuantity;
      deltaLabel = diff >= 0 ? `+${diff}` : `${diff}`;
    }
  }

  async function handleSubmit(values: AdjustStockFormValues) {
    setFormError(null);
    try {
      await onSubmit(toAdjustStockDto(values));
      onOpenChange(false);
    } catch (error) {
      applyApiFormErrors<keyof AdjustStockFormValues>({
        error,
        setFormError,
        setFieldError: (name, message) => form.setError(name, { message }),
      });
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adjust stock</DialogTitle>
        <DialogDescription>
          Update available quantity for “{productTitle}”. Changes are applied
          by the API.
        </DialogDescription>
      </DialogHeader>

      {conflictMessage ? (
        <Alert>
          <AlertTitle>Stock was updated elsewhere</AlertTitle>
          <AlertDescription>{conflictMessage}</AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not adjust stock</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...field}
                  >
                    {ADJUST_STOCK_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    placeholder="Enter quantity…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {availableQuantity !== undefined ? (
            <div className="rounded-md border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground space-y-1">
              <div>
                <span className="font-medium text-foreground">Stock preview: </span>
                Current available: <span className="font-mono font-medium text-foreground">{availableQuantity}</span>
                {computedAvailable !== null ? (
                  <>
                    {' → '}
                    New available: <span className="font-mono font-semibold text-foreground">{computedAvailable}</span>{' '}
                    <span className="text-muted-foreground">({deltaLabel})</span>
                  </>
                ) : null}
              </div>
              {watchedType === 'SUBTRACT' && isValidQty && parsedQty > availableQuantity ? (
                <p className="text-[11px] text-destructive">
                  Note: Subtract quantity exceeds current available stock.
                </p>
              ) : null}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder="Optional reason for adjustment…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving…' : 'Apply adjustment'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
