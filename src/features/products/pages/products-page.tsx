import { useState, type SubmitEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  QueryListRegion,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { ProductsTable } from '@/features/products/components/products-table';
import { useCategoriesListQuery } from '@/features/products/hooks/use-categories';
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

function productFilterDraftKey(filters: ProductListFilters): string {
  return [
    filters.search ?? '',
    filters.minPrice ?? '',
    filters.maxPrice ?? '',
    filters.categoryId ?? '',
  ].join('\0');
}

function ProductsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_products');
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = productListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useProductsListQuery(filters);
  const { data: categories } = useCategoriesListQuery();

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

  const draftKey = productFilterDraftKey(filters);
  const [prevDraftKey, setPrevDraftKey] = useState(draftKey);
  if (draftKey !== prevDraftKey) {
    setPrevDraftKey(draftKey);
    setSearchDraft(filters.search ?? '');
    setMinPriceDraft(
      filters.minPrice !== undefined ? String(filters.minPrice) : '',
    );
    setMaxPriceDraft(
      filters.maxPrice !== undefined ? String(filters.maxPrice) : '',
    );
    setCategoryIdDraft(
      filters.categoryId !== undefined ? String(filters.categoryId) : '',
    );
  }

  function updateFilters(next: ProductListFilters) {
    setSearchParams(productListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: SubmitEvent) {
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

  const secondaryCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.categoryId,
  ].filter((v) => v !== undefined).length;
  const [filtersOpen, setFiltersOpen] = useState(secondaryCount > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Browse the catalog and manage product details."
      >
        <Button asChild variant="outline">
          <Link to="/products/categories">Manage categories</Link>
        </Button>
        {canManage ? (
          <Button asChild>
            <Link to="/products/new">New product</Link>
          </Button>
        ) : null}
      </PageHeader>

      <div className="space-y-3">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={applyTextFilters}
            className="flex flex-1 items-center gap-2 min-w-[240px] max-w-md"
          >
            <Input
              id="products-search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search name, SKU, or description…"
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-9 shrink-0">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <select
              id="products-active"
              aria-label="Status filter"
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={activeValue}
              onChange={(e) => {
                const value = e.target.value as ActiveFilter;
                updateFilters({
                  ...filters,
                  page: 1,
                  isActive:
                    value === 'true'
                      ? true
                      : value === 'false'
                        ? false
                        : undefined,
                });
              }}
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <Button
              type="button"
              variant={filtersOpen || secondaryCount > 0 ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="h-9 gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {secondaryCount > 0 ? (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  {secondaryCount}
                </span>
              ) : null}
            </Button>

            {hasActiveProductListFilters(filters) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateFilters(DEFAULT_PRODUCT_LIST_FILTERS)}
                className="h-9 text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {filtersOpen ? (
          <div className="rounded-lg border border-border bg-card/60 p-3.5">
            <form
              onSubmit={applyTextFilters}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="space-y-1">
                <Label htmlFor="products-min-price" className="text-xs text-muted-foreground">
                  Min price
                </Label>
                <Input
                  id="products-min-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={minPriceDraft}
                  onChange={(e) => setMinPriceDraft(e.target.value)}
                  placeholder="0.00"
                  className="h-8 w-28 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="products-max-price" className="text-xs text-muted-foreground">
                  Max price
                </Label>
                <Input
                  id="products-max-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={maxPriceDraft}
                  onChange={(e) => setMaxPriceDraft(e.target.value)}
                  placeholder="0.00"
                  className="h-8 w-28 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="products-category-id" className="text-xs text-muted-foreground">
                  Category
                </Label>
                <select
                  id="products-category-id"
                  value={categoryIdDraft}
                  onChange={(e) => setCategoryIdDraft(e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All categories</option>
                  {(categories ?? []).map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" size="sm" variant="secondary" className="h-8">
                Apply price & category
              </Button>
            </form>
          </div>
        ) : null}

        {/* Active Filter Chips */}
        {hasActiveProductListFilters(filters) ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-muted-foreground">Active:</span>
            {filters.search ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Search: "{filters.search}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, search: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove search filter</span>
                </button>
              </span>
            ) : null}
            {filters.isActive !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Status: {filters.isActive ? 'Active' : 'Inactive'}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, isActive: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove status filter</span>
                </button>
              </span>
            ) : null}
            {filters.minPrice !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Min: ${filters.minPrice}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, minPrice: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove min price filter</span>
                </button>
              </span>
            ) : null}
            {filters.maxPrice !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Max: ${filters.maxPrice}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, maxPrice: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove max price filter</span>
                </button>
              </span>
            ) : null}
            {filters.categoryId !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Category:{' '}
                {categories?.find((cat) => cat.id === filters.categoryId)
                  ?.name ?? `Category #${filters.categoryId}`}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({
                      ...filters,
                      page: 1,
                      categoryId: undefined,
                    })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove category filter</span>
                </button>
              </span>
            ) : null}
          </div>
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

export { ProductsPage };
export default ProductsPage;
