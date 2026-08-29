import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  toAdjustStockDto,
  type AdjustStockFormValues,
} from '@/features/inventory/schemas/adjust-stock-schema';
import type { AdjustStockDto } from '@/features/inventory/types';
import {
  ApiRequestError,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';

type AdjustStockDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTitle: string;
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
  conflictMessage,
  onSubmit,
}: AdjustStockDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (open) {
      form.reset(emptyDefaults);
      setFormError(null);
    }
  }, [open, form]);

  async function handleSubmit(values: AdjustStockFormValues) {
    setFormError(null);
    try {
      await onSubmit(toAdjustStockDto(values));
      onOpenChange(false);
    } catch (error) {
      if (isOptimisticLockConflict(error)) {
        return;
      }
      if (error instanceof ApiRequestError) {
        setFormError(error.message);
        return;
      }
      setFormError('Something went wrong. Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      <option value="ADD">Add</option>
                      <option value="SUBTRACT">Subtract</option>
                      <option value="SET">Set</option>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
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
    </Dialog>
  );
}
