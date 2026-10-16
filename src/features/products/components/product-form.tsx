import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { useCategoriesListQuery } from '@/features/products/hooks/use-categories';
import { usePlatformConfigQuery } from '@/features/products/hooks/use-platform-config';
import { ProductImagePreview } from '@/features/products/components/product-image-preview';
import { applyApiFormErrors } from '@/lib/api/form-api-errors';

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
  currency: '',
  imageUrl: '',
  categoryId: '',
};

function matchProductField(
  message: string,
): keyof ProductFormValues | null {
  const lower = message.toLowerCase();
  if (lower.includes('name')) return 'name';
  if (lower.includes('price')) return 'price';
  if (lower.includes('slug')) return 'slug';
  if (lower.includes('sku')) return 'sku';
  if (lower.includes('currency')) return 'currency';
  if (lower.includes('image')) return 'imageUrl';
  if (lower.includes('category')) return 'categoryId';
  return null;
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
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesListQuery();
  const { data: storeConfig, isLoading: storeConfigLoading } =
    usePlatformConfigQuery();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      ...emptyDefaults,
      ...defaultValues,
      currency:
        defaultValues?.currency ||
        (mode === 'create' ? storeConfig?.defaultCurrency ?? '' : ''),
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
        currency: defaultValues.currency ?? '',
        imageUrl: defaultValues.imageUrl ?? '',
        categoryId: defaultValues.categoryId ?? '',
        price:
          defaultValues.price !== undefined && defaultValues.price !== null
            ? String(defaultValues.price)
            : '',
      });
    }
  }, [defaultValues, form]);

  useEffect(() => {
    if (mode === 'create' && storeConfig?.defaultCurrency) {
      const currentCurrency = form.getValues('currency');
      if (!currentCurrency) {
        form.setValue('currency', storeConfig.defaultCurrency, {
          shouldValidate: true,
        });
      }
    }
  }, [mode, storeConfig?.defaultCurrency, form]);

  const isSubmitting = form.formState.isSubmitting;
  const [watchedName, watchedCategoryId, watchedCurrency] = useWatch({
    control: form.control,
    name: ['name', 'categoryId', 'currency'],
  });

  const displayedCurrency =
    watchedCurrency ||
    (mode === 'edit'
      ? defaultValues?.currency || storeConfig?.defaultCurrency
      : storeConfig?.defaultCurrency) ||
    '';

  const isLegacyCurrency =
    mode === 'edit' &&
    Boolean(defaultValues?.currency) &&
    Boolean(storeConfig?.defaultCurrency) &&
    defaultValues?.currency !== storeConfig?.defaultCurrency;

  const currencyStep =
    storeConfig?.defaultCurrencyExponent !== undefined &&
    displayedCurrency === storeConfig.defaultCurrency
      ? storeConfig.defaultCurrencyExponent === 0
        ? '1'
        : (1 / Math.pow(10, storeConfig.defaultCurrencyExponent)).toFixed(
            storeConfig.defaultCurrencyExponent,
          )
      : ['JPY', 'KRW', 'VND', 'CLP'].includes(displayedCurrency)
        ? '1'
        : ['BHD', 'JOD', 'KWD', 'OMR', 'TND'].includes(displayedCurrency)
          ? '0.001'
          : '0.01';

  async function handleSubmit(values: ProductFormValues) {
    setFormError(null);
    try {
      await onSubmit(toProductSubmitValues(values));
    } catch (error) {
      applyApiFormErrors({
        error,
        setFormError,
        setFieldError: (name, message) => form.setError(name, { message }),
        matchField: matchProductField,
      });
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

        {isLegacyCurrency ? (
          <Alert className="border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <AlertTitle>Legacy Currency Discrepancy</AlertTitle>
            <AlertDescription>
              This product is configured in{' '}
              <strong>{defaultValues?.currency}</strong>, which differs from
              the active store currency (
              <strong>{storeConfig?.defaultCurrency}</strong>).
            </AlertDescription>
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
              <div className="relative flex items-center">
                <FormControl>
                  <Input
                    type="number"
                    step={currencyStep}
                    min="0"
                    inputMode="decimal"
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ''}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="pr-16"
                  />
                </FormControl>
                <span
                  aria-label={
                    displayedCurrency
                      ? `Currency: ${displayedCurrency}`
                      : 'Currency indicator'
                  }
                  className="pointer-events-none absolute right-3 inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground"
                >
                  {displayedCurrency || (storeConfigLoading ? '...' : '')}
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...form.register('currency')} />

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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
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
              <ProductImagePreview
                url={field.value ?? ''}
                name={watchedName ?? ''}
                categoryId={watchedCategoryId ? Number(watchedCategoryId) : null}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={categoriesLoading}
                  required
                  aria-required="true"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select category</option>
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
