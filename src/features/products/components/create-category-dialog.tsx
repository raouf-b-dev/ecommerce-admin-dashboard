import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  categoryFormSchema,
  toCreateCategoryDto,
  type CategoryFormValues,
} from '@/features/products/schemas/category-schema';
import { ActionErrorAlert } from '@/components/feedback/action-error-alert';
import { getErrorMessage } from '@/lib/api/parse-api-error';

type CreateCategoryDialogProps = {
  open: boolean;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CreateCategoryDialog({
  open,
  isPending,
  onOpenChange,
  onSubmit,
}: CreateCategoryDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
        }
      }}
    >
      {open ? (
        <CreateCategoryDialogBody
          isPending={isPending}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      ) : null}
    </Dialog>
  );
}

function CreateCategoryDialogBody({
  isPending,
  onOpenChange,
  onSubmit,
}: Omit<CreateCategoryDialogProps, 'open'>) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  async function handleSubmit(values: CategoryFormValues) {
    setErrorMessage(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Failed to create category'));
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create category</DialogTitle>
        <DialogDescription>
          Add a catalog category. Slug is optional; the API can derive it from
          the name.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => handleSubmit(values))}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value ?? ''} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ActionErrorAlert
            title="Could not create category"
            message={errorMessage}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

export { toCreateCategoryDto };
