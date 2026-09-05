import { useState, type SubmitEvent } from 'react';
import { useSearchParams } from 'react-router';
import { SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  QueryListRegion,
  QueryStateAlert,
} from '@/components/feedback/query-state';
import { InventoryTable } from '@/features/inventory/components/inventory-table';
import { useInventoryListQuery } from '@/features/inventory/hooks/use-inventory';
import {
  DEFAULT_INVENTORY_LIST_FILTERS,
  hasActiveInventoryListFilters,
  inventoryListFiltersFromSearchParams,
  inventoryListFiltersToSearchParams,
} from '@/features/inventory/lib/inventory-list-filters';
import type { InventoryListFilters } from '@/features/inventory/types';

function inventoryFilterDraftKey(filters: InventoryListFilters): string {
  return [
    filters.sku ?? '',
    filters.productTitle ?? '',
    filters.productId ?? '',
  ].join('\0');
}

function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = inventoryListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInventoryListQuery(filters);

  const [skuDraft, setSkuDraft] = useState(filters.sku ?? '');
  const [titleDraft, setTitleDraft] = useState(filters.productTitle ?? '');
  const [productIdDraft, setProductIdDraft] = useState(
    filters.productId !== undefined ? String(filters.productId) : '',
  );
  const draftKey = inventoryFilterDraftKey(filters);
  const [prevDraftKey, setPrevDraftKey] = useState(draftKey);
  if (draftKey !== prevDraftKey) {
    setPrevDraftKey(draftKey);
    setSkuDraft(filters.sku ?? '');
    setTitleDraft(filters.productTitle ?? '');
    setProductIdDraft(
      filters.productId !== undefined ? String(filters.productId) : '',
    );
  }

  const secondaryCount = filters.productId !== undefined ? 1 : 0;
  const [filtersOpen, setFiltersOpen] = useState(secondaryCount > 0);

  function updateFilters(next: InventoryListFilters) {
    setSearchParams(inventoryListFiltersToSearchParams(next), {
      replace: true,
    });
  }

  function applyTextFilters(event: SubmitEvent) {
    event.preventDefault();
    const productId = productIdDraft.trim()
      ? Number(productIdDraft)
      : undefined;

    updateFilters({
      ...filters,
      page: 1,
      sku: skuDraft.trim() || undefined,
      productTitle: titleDraft.trim() || undefined,
      productId:
        productId !== undefined &&
        Number.isInteger(productId) &&
        productId > 0
          ? productId
          : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="View stock levels for catalog products."
      />

      <div className="space-y-3">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={applyTextFilters}
            className="flex flex-wrap items-center gap-2"
          >
            <Input
              id="inventory-sku"
              value={skuDraft}
              onChange={(e) => setSkuDraft(e.target.value)}
              placeholder="Filter by SKU…"
              className="h-9 w-36"
            />
            <Input
              id="inventory-title"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Filter by title…"
              className="h-9 w-48"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-9 shrink-0">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <label
              htmlFor="inventory-low-stock"
              className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-input px-3 text-sm"
            >
              <input
                id="inventory-low-stock"
                type="checkbox"
                className="size-4 rounded border border-input accent-primary"
                checked={filters.lowStockOnly === true}
                onChange={(e) =>
                  updateFilters({
                    ...filters,
                    page: 1,
                    lowStockOnly: e.target.checked ? true : undefined,
                  })
                }
              />
              <span className="text-foreground">Low stock only</span>
            </label>

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

            {hasActiveInventoryListFilters(filters) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateFilters(DEFAULT_INVENTORY_LIST_FILTERS)}
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
                <Label htmlFor="inventory-product-id" className="text-xs text-muted-foreground">
                  Product ID
                </Label>
                <Input
                  id="inventory-product-id"
                  type="number"
                  min={1}
                  step={1}
                  value={productIdDraft}
                  onChange={(e) => setProductIdDraft(e.target.value)}
                  placeholder="e.g. 1"
                  className="h-8 w-28 text-sm"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" className="h-8">
                Apply advanced filters
              </Button>
            </form>
          </div>
        ) : null}

        {/* Active Filter Chips */}
        {hasActiveInventoryListFilters(filters) ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-muted-foreground">Active:</span>
            {filters.sku ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                SKU: "{filters.sku}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, sku: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove SKU filter</span>
                </button>
              </span>
            ) : null}
            {filters.productTitle ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Title: "{filters.productTitle}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, productTitle: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove title filter</span>
                </button>
              </span>
            ) : null}
            {filters.lowStockOnly ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Low stock
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, lowStockOnly: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove low stock filter</span>
                </button>
              </span>
            ) : null}
            {filters.productId ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Product #{filters.productId}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, productId: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove product filter</span>
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
        resource="inventory"
      />

      <QueryListRegion
        isLoading={isLoading}
        isFetching={isFetching}
        loadingLabel="Loading inventory…"
        hasData={Boolean(data)}
      >
        {data ? (
          <InventoryTable
            items={data.items}
            total={data.total}
            filters={filters}
            onFiltersChange={updateFilters}
          />
        ) : null}
      </QueryListRegion>
    </div>
  );
}

export { InventoryPage };
export default InventoryPage;
