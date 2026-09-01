import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  QueryListRegion,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { ProductsTable } from '@/features/products/components/products-table';
import { useProductsListQuery } from '@/features/products/hooks/use-products';
import {
  DEFAULT_PRODUCT_LIST_FILTERS,
  hasActiveProductListFilters,
  productListFiltersFromSearchParams,
  productListFiltersToSearchParams,
} from '@/features/products/lib/product-list-filters';
import type { ProductListFilters } from '@/features/products/types';
import { useAuth } from '@/lib/auth/auth-context';

type ActiveFilter = '' | 'true' | 'false';

export function ProductsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_products');
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = productListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsListQuery(filters);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? '');
  const [minPriceDraft, setMinPriceDraft] = useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : '',
  );
  const [maxPriceDraft, setMaxPriceDraft] = useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
  );
  const [categoryIdDraft, setCategoryIdDraft] = useState(
    filters.categoryId !== undefined ? String(filters.categoryId) : '',
  );

  function updateFilters(next: ProductListFilters) {
    setSearchParams(productListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: FormEvent) {
    event.preventDefault();
    const minPrice = minPriceDraft.trim()
      ? Number(minPriceDraft)
      : undefined;
    const maxPrice = maxPriceDraft.trim()
      ? Number(maxPriceDraft)
      : undefined;
    const categoryId = categoryIdDraft.trim()
      ? Number(categoryIdDraft)
      : undefined;

    updateFilters({
      ...filters,
      page: 1,
      search: searchDraft.trim() || undefined,
      minPrice:
        minPrice !== undefined && Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice:
        maxPrice !== undefined && Number.isFinite(maxPrice) ? maxPrice : undefined,
      categoryId:
        categoryId !== undefined &&
        Number.isInteger(categoryId) &&
        categoryId > 0
          ? categoryId
          : undefined,
    });
  }

  const activeValue: ActiveFilter =
    filters.isActive === true
      ? 'true'
      : filters.isActive === false
        ? 'false'
        : '';

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

      <div className="flex flex-wrap items-end gap-4">
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={applyTextFilters}
        >
          <div className="space-y-2">
            <Label htmlFor="products-search">Search</Label>
            <Input
              id="products-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Name, SKU, or description"
              className="w-56"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="products-min-price">Min price</Label>
            <Input
              id="products-min-price"
              type="number"
              min={0}
              step="0.01"
              value={minPriceDraft}
              onChange={(e) => setMinPriceDraft(e.target.value)}
              className="w-28"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="products-max-price">Max price</Label>
            <Input
              id="products-max-price"
              type="number"
              min={0}
              step="0.01"
              value={maxPriceDraft}
              onChange={(e) => setMaxPriceDraft(e.target.value)}
              className="w-28"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="products-category-id">Category ID</Label>
            <Input
              id="products-category-id"
              type="number"
              min={1}
              step={1}
              value={categoryIdDraft}
              onChange={(e) => setCategoryIdDraft(e.target.value)}
              className="w-28"
            />
          </div>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>

        <div className="space-y-2">
          <Label htmlFor="products-active">Status</Label>
          <select
            id="products-active"
            className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={activeValue}
            onChange={(e) => {
              const value = e.target.value as ActiveFilter;
              updateFilters({
                ...filters,
                page: 1,
                isActive:
                  value === 'true' ? true : value === 'false' ? false : undefined,
              });
            }}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {hasActiveProductListFilters(filters) ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateFilters(DEFAULT_PRODUCT_LIST_FILTERS)}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

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
