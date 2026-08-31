import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  QueryListRegion,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { ProductsTable } from '@/features/products/components/products-table';
import { useProductsListQuery } from '@/features/products/hooks/use-products';
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
    useProductsListQuery(filters);

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

      <QueryStateAlert
        isError={isError}
        hasData={Boolean(data)}
        error={error}
        onRetry={() => refetch()}
        resource="products"
      />

      <QueryListRegion
        isLoading={isLoading}
        isFetching={isFetching}
        loadingLabel="Loading products…"
        hasData={Boolean(data)}
      >
        {data ? (
          <ProductsTable
            items={data.items}
            total={data.total}
            filters={filters}
            canManage={canManage}
            onFiltersChange={updateFilters}
          />
        ) : null}
      </QueryListRegion>
    </div>
  );
}
