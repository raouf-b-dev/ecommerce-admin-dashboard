import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DeleteProductDialog } from '@/features/products/components/delete-product-dialog';
import { ProductForm } from '@/features/products/components/product-form';
import { ProductStatusActions } from '@/features/products/components/product-status-actions';
import {
  useActivateProduct,
  useDeactivateProduct,
  useDeleteProduct,
  useProductQuery,
  useUpdateProduct,
} from '@/features/products/hooks/use-products';
import {
  toUpdateProductDto,
  type ProductFormValues,
  type ProductSubmitValues,
} from '@/features/products/schemas/product-schema';
import { QueryLoading } from '@/components/feedback/query-state';
import {
  getErrorMessage,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';
import { useAuth } from '@/lib/auth/auth-context';

const CONFLICT_MESSAGE =
  'This product was modified by another request. The form was reloaded with the latest data — review the values and save again.';

function nullableToOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function ProductEditPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canViewInventory = hasPermission('view_all_inventory');
  const canManageProducts = hasPermission('manage_products');
  const params = useParams();
  const id = Number(params.id);
  const validId = Number.isFinite(id) && id > 0;
  const productQuery = useProductQuery(validId ? id : undefined);
  const updateProduct = useUpdateProduct(id);
  const deleteProduct = useDeleteProduct(id);
  const activateProduct = useActivateProduct(id);
  const deactivateProduct = useDeactivateProduct(id);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const defaultValues = useMemo<Partial<ProductFormValues> | undefined>(() => {
    const product = productQuery.data;
    if (!product) {
      return undefined;
    }

    return {
      name: product.name,
      price: String(product.price),
      slug: product.slug,
      description: nullableToOptionalString(product.description) ?? '',
      sku: nullableToOptionalString(product.sku) ?? '',
      currency: product.currency,
      imageUrl: nullableToOptionalString(product.imageUrl) ?? '',
      categoryId:
        typeof product.categoryId === 'number'
          ? String(product.categoryId)
          : '',
    };
  }, [productQuery.data]);

  async function handleSubmit(values: ProductSubmitValues) {
    setConflictMessage(null);
    try {
      await updateProduct.mutateAsync(toUpdateProductDto(values));
      navigate('/products');
    } catch (error) {
      if (isOptimisticLockConflict(error)) {
        // Hook invalidates detail; banner only — do not rethrow into formError.
        setConflictMessage(CONFLICT_MESSAGE);
        return;
      }
      throw error;
    }
  }

  if (!validId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid product</AlertTitle>
        <AlertDescription>
          The product id in the URL is not valid.
        </AlertDescription>
      </Alert>
    );
  }

  if (productQuery.isLoading) {
    return <QueryLoading>Loading product…</QueryLoading>;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load product</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>
            {getErrorMessage(productQuery.error, 'Product not found')}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => productQuery.refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit product"
        description={`Update “${productQuery.data.name}”. Price is in major currency units.`}
      >
        {canViewInventory ? (
          <Button asChild variant="outline">
            <Link to={`/inventory?productId=${id}`}>View stock</Link>
          </Button>
        ) : null}
        {canManageProducts ? (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete product
          </Button>
        ) : null}
      </PageHeader>
      <ProductForm
        mode="edit"
        defaultValues={defaultValues}
        submitLabel="Save changes"
        conflictMessage={conflictMessage}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
      />
      {canManageProducts ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Catalog status</h2>
            <p className="text-sm text-muted-foreground">
              {productQuery.data.isActive
                ? 'This product is active in the catalog.'
                : 'This product is inactive and hidden from the catalog.'}
            </p>
          </div>
          <ProductStatusActions
            isActive={productQuery.data.isActive}
            isPending={
              activateProduct.isPending || deactivateProduct.isPending
            }
            onActivate={async () => {
              await activateProduct.mutateAsync();
            }}
            onDeactivate={async () => {
              await deactivateProduct.mutateAsync();
            }}
          />
        </section>
      ) : null}
      {canManageProducts ? (
        <DeleteProductDialog
          open={deleteOpen}
          productName={productQuery.data.name}
          isPending={deleteProduct.isPending}
          onOpenChange={setDeleteOpen}
          onConfirm={async () => {
            await deleteProduct.mutateAsync();
            navigate('/products');
          }}
        />
      ) : null}
    </div>
  );
}
