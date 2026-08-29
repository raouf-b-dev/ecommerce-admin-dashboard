import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ProductsTable } from '@/features/products/components/products-table';
import { useProductsQuery } from '@/features/products/hooks/use-products';
import {
  productListFiltersFromSearchParams,
  productListFiltersToSearchParams,
} from '@/features/products/lib/product-list-filters';
import type { ProductListFilters } from '@/features/products/types';
import { useAuth } from '@/lib/auth/auth-context';

export function ProductsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_products');
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = productListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsQuery(filters);

  function updateFilters(next: ProductListFilters) {
    setSearchParams(productListFiltersToSearchParams(next), { replace: true });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Browse the catalog and manage product details."
      >
        {canManage ? (
          <Button asChild>
            <Link to="/products/new">New product</Link>
          </Button>
        ) : null}
      </PageHeader>

      {isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load products</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {error instanceof Error ? error.message : 'Unexpected error'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading products…</p>
      ) : data ? (
        <div
          className={isFetching ? 'opacity-70 transition-opacity' : undefined}
        >
          <ProductsTable
            items={data.items}
            total={data.total}
            filters={filters}
            canManage={canManage}
            onFiltersChange={updateFilters}
          />
        </div>
      ) : null}
    </div>
  );
}
