import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
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
import { formatMoney } from '@/lib/format';

const CONFLICT_MESSAGE =
  'This product was modified by another request. The form was reloaded with the latest data - review the values and save again.';

function nullableToOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function ProductEditPage() {
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

  const product = productQuery.data;

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Edit product
              </h1>
              <StatusBadge variant="product" isActive={product.isActive} />
              {product.sku ? (
                <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {product.sku}
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {formatMoney(product.price, product.currency)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Update “{product.name}”. Price is in major currency units.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canViewInventory ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/inventory?productId=${id}`}>View stock</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-xl">Product details</CardTitle>
              <CardDescription>
                Catalog specifications, pricing, and category classification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductForm
                mode="edit"
                defaultValues={defaultValues}
                submitLabel="Save changes"
                conflictMessage={conflictMessage}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/products')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-6">
          {/* Image Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media asset</CardTitle>
              <CardDescription>
                Catalog thumbnail preview
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.imageUrl ? (
                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/10 p-6 text-center text-xs text-muted-foreground">
                  <ImageIcon className="mb-2 h-7 w-7 opacity-40" />
                  No image URL provided
                </div>
              )}
            </CardContent>
          </Card>

          {/* Catalog Status Card */}
          {canManageProducts ? (
            <Card>
              <CardHeader>
                <CardTitle as="h2" className="text-base">Catalog status</CardTitle>
                <CardDescription>
                  {product.isActive
                    ? 'This product is active in the catalog.'
                    : 'This product is inactive and hidden from the catalog.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current visibility</span>
                  <StatusBadge variant="product" isActive={product.isActive} />
                </div>
                <ProductStatusActions
                  isActive={product.isActive}
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
              </CardContent>
            </Card>
          ) : null}

          {/* Danger Zone Card */}
          {canManageProducts ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Permanently remove this product from the catalog.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Deleting this product cannot be undone. Associated inventory and order histories may be affected.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete product
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {canManageProducts ? (
        <DeleteProductDialog
          open={deleteOpen}
          productName={product.name}
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

export { ProductEditPage };
export default ProductEditPage;
