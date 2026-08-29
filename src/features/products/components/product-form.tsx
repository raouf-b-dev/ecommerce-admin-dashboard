import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  createProductSchema,
  toProductSubmitValues,
  type ProductFormValues,
  type ProductSubmitValues,
} from '@/features/products/schemas/product-schema';
import {
  ApiRequestError,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';

export type ProductFormMode = 'create' | 'edit';

type ProductFormProps = {
  mode: ProductFormMode;
  defaultValues?: Partial<ProductFormValues>;
  submitLabel: string;
  conflictMessage?: string | null;
  onSubmit: (values: ProductSubmitValues) => Promise<void>;
  onCancel?: () => void;
};

const emptyDefaults: ProductFormValues = {
  name: '',
  price: '',
  slug: '',
  description: '',
  sku: '',
  currency: 'USD',
  imageUrl: '',
  categoryId: '',
};

function mapApiErrorToForm(
  error: unknown,
  setFormError: (message: string) => void,
  setFieldError: (name: keyof ProductFormValues, message: string) => void,
) {
  if (isOptimisticLockConflict(error)) {
    return;
  }

  if (!(error instanceof ApiRequestError)) {
    setFormError('Something went wrong. Please try again.');
    return;
  }

  if (error.errors && error.errors.length > 0) {
    setFormError(error.message);
    for (const item of error.errors) {
      const lower = item.toLowerCase();
      if (lower.includes('name')) {
        setFieldError('name', item);
      } else if (lower.includes('price')) {
        setFieldError('price', item);
      } else if (lower.includes('slug')) {
        setFieldError('slug', item);
      } else if (lower.includes('sku')) {
        setFieldError('sku', item);
      } else if (lower.includes('image')) {
        setFieldError('imageUrl', item);
      } else if (lower.includes('category')) {
        setFieldError('categoryId', item);
      }
    }
    return;
  }

  setFormError(error.message);
}

export function ProductForm({
  mode,
  defaultValues,
  submitLabel,
  conflictMessage,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      ...emptyDefaults,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...emptyDefaults,
        ...defaultValues,
        slug: defaultValues.slug ?? '',
        description: defaultValues.description ?? '',
        sku: defaultValues.sku ?? '',
        currency: defaultValues.currency ?? 'USD',
        imageUrl: defaultValues.imageUrl ?? '',
        categoryId: defaultValues.categoryId ?? '',
        price:
          defaultValues.price !== undefined && defaultValues.price !== null
            ? String(defaultValues.price)
            : '',
      });
    }
  }, [defaultValues, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: ProductFormValues) {
    setFormError(null);
    try {
      await onSubmit(toProductSubmitValues(values));
    } catch (error) {
      mapApiErrorToForm(error, setFormError, (name, message) =>
        form.setError(name, { message }),
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="max-w-2xl space-y-6"
        noValidate
      >
        {conflictMessage ? (
          <Alert variant="destructive">
            <AlertTitle>Product was updated elsewhere</AlertTitle>
            <AlertDescription>{conflictMessage}</AlertDescription>
          </Alert>
        ) : null}

        {formError ? (
          <Alert variant="destructive">
            <AlertTitle>
              {mode === 'create'
                ? 'Could not create product'
                : 'Could not save product'}
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}

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
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                <Textarea {...field} value={field.value ?? ''} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  autoComplete="off"
                  placeholder="https://"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category ID</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </Form>
  );
}
