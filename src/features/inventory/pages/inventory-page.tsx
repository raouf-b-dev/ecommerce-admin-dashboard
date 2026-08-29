import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InventoryTable } from '@/features/inventory/components/inventory-table';
import { useInventoryListQuery } from '@/features/inventory/hooks/use-inventory';
import {
  inventoryListFiltersFromSearchParams,
  inventoryListFiltersToSearchParams,
} from '@/features/inventory/lib/inventory-list-filters';
import type { InventoryListFilters } from '@/features/inventory/types';

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = inventoryListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInventoryListQuery(filters);

  const [skuDraft, setSkuDraft] = useState(filters.sku ?? '');
  const [titleDraft, setTitleDraft] = useState(filters.productTitle ?? '');

  function updateFilters(next: InventoryListFilters) {
    setSearchParams(inventoryListFiltersToSearchParams(next), {
      replace: true,
    });
  }

  function applyTextFilters(event: FormEvent) {
    event.preventDefault();
    updateFilters({
      ...filters,
      page: 1,
      sku: skuDraft.trim() || undefined,
      productTitle: titleDraft.trim() || undefined,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventory"
        description="View stock levels for catalog products."
      />

      <div className="flex flex-wrap items-end gap-4">
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={applyTextFilters}
        >
          <div className="space-y-2">
            <Label htmlFor="inventory-sku">SKU</Label>
            <Input
              id="inventory-sku"
              value={skuDraft}
              onChange={(e) => setSkuDraft(e.target.value)}
              placeholder="Filter by SKU"
              className="w-44"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inventory-title">Product title</Label>
            <Input
              id="inventory-title"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder="Filter by title"
              className="w-56"
            />
          </div>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>

        <div className="flex items-center gap-2 pb-2">
          <input
            id="inventory-low-stock"
            type="checkbox"
            className="size-4 rounded border border-input"
            checked={filters.lowStockOnly === true}
            onChange={(e) =>
              updateFilters({
                ...filters,
                page: 1,
                lowStockOnly: e.target.checked ? true : undefined,
              })
            }
          />
          <Label htmlFor="inventory-low-stock">Low stock only</Label>
        </div>
      </div>

      {isError && !data ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load inventory</AlertTitle>
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

      {isError && data ? (
        <Alert>
          <AlertTitle>Could not refresh inventory</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>
              {error instanceof Error
                ? error.message
                : 'Showing the last loaded results.'}
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
        <p className="text-sm text-muted-foreground">Loading inventory…</p>
      ) : data ? (
        <div
          className={isFetching ? 'opacity-70 transition-opacity' : undefined}
        >
          <InventoryTable
            items={data.items}
            total={data.total}
            filters={filters}
            onFiltersChange={updateFilters}
          />
        </div>
      ) : null}
    </div>
  );
}
