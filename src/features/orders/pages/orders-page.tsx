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
import { OrdersTable } from '@/features/orders/components/orders-table';
import { useOrdersListQuery } from '@/features/orders/hooks/use-orders';
import {
  DEFAULT_ORDER_LIST_FILTERS,
  hasActiveOrderListFilters,
  ORDER_STATUS_OPTIONS,
  orderListFiltersFromSearchParams,
  orderListFiltersToSearchParams,
} from '@/features/orders/lib/order-list-filters';
import type { OrderListFilters, OrderStatus } from '@/features/orders/types';

function orderFilterDraftKey(filters: OrderListFilters): string {
  return [
    filters.userEmail ?? '',
    filters.userName ?? '',
    filters.firstName ?? '',
    filters.lastName ?? '',
    filters.createdAfter ?? '',
    filters.createdBefore ?? '',
    filters.minAmount ?? '',
    filters.maxAmount ?? '',
  ].join('\0');
}

function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = orderListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrdersListQuery(filters);

  const [emailDraft, setEmailDraft] = useState(filters.userEmail ?? '');
  const [nameDraft, setNameDraft] = useState(filters.userName ?? '');
  const [firstNameDraft, setFirstNameDraft] = useState(filters.firstName ?? '');
  const [lastNameDraft, setLastNameDraft] = useState(filters.lastName ?? '');
  const [createdAfterDraft, setCreatedAfterDraft] = useState(
    filters.createdAfter ?? '',
  );
  const [createdBeforeDraft, setCreatedBeforeDraft] = useState(
    filters.createdBefore ?? '',
  );
  const [minAmountDraft, setMinAmountDraft] = useState(
    filters.minAmount !== undefined ? String(filters.minAmount) : '',
  );
  const [maxAmountDraft, setMaxAmountDraft] = useState(
    filters.maxAmount !== undefined ? String(filters.maxAmount) : '',
  );
  const draftKey = orderFilterDraftKey(filters);
  const [prevDraftKey, setPrevDraftKey] = useState(draftKey);
  if (draftKey !== prevDraftKey) {
    setPrevDraftKey(draftKey);
    setEmailDraft(filters.userEmail ?? '');
    setNameDraft(filters.userName ?? '');
    setFirstNameDraft(filters.firstName ?? '');
    setLastNameDraft(filters.lastName ?? '');
    setCreatedAfterDraft(filters.createdAfter ?? '');
    setCreatedBeforeDraft(filters.createdBefore ?? '');
    setMinAmountDraft(
      filters.minAmount !== undefined ? String(filters.minAmount) : '',
    );
    setMaxAmountDraft(
      filters.maxAmount !== undefined ? String(filters.maxAmount) : '',
    );
  }

  const secondaryCount = [
    filters.userName,
    filters.firstName,
    filters.lastName,
    filters.createdAfter,
    filters.createdBefore,
    filters.minAmount,
    filters.maxAmount,
  ].filter((v) => v !== undefined && v !== '').length;
  const [filtersOpen, setFiltersOpen] = useState(secondaryCount > 0);

  function updateFilters(next: OrderListFilters) {
    setSearchParams(orderListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: SubmitEvent) {
    event.preventDefault();
    const minAmount = minAmountDraft.trim()
      ? Number(minAmountDraft)
      : undefined;
    const maxAmount = maxAmountDraft.trim()
      ? Number(maxAmountDraft)
      : undefined;

    updateFilters({
      ...filters,
      page: 1,
      userEmail: emailDraft.trim() || undefined,
      userName: nameDraft.trim() || undefined,
      firstName: firstNameDraft.trim() || undefined,
      lastName: lastNameDraft.trim() || undefined,
      createdAfter: createdAfterDraft.trim() || undefined,
      createdBefore: createdBeforeDraft.trim() || undefined,
      minAmount:
        minAmount !== undefined && Number.isFinite(minAmount)
          ? minAmount
          : undefined,
      maxAmount:
        maxAmount !== undefined && Number.isFinite(maxAmount)
          ? maxAmount
          : undefined,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Inspect orders and run allowed status transitions."
      />

      <div className="space-y-3">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <form
            onSubmit={applyTextFilters}
            className="flex flex-1 items-center gap-2 min-w-[240px] max-w-md"
          >
            <Input
              id="orders-email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="Search by customer email…"
              className="h-9"
            />
            <Button type="submit" size="sm" variant="secondary" className="h-9 shrink-0">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <select
              id="orders-status"
              aria-label="Status filter"
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={filters.status ?? ''}
              onChange={(e) => {
                const value = e.target.value as '' | OrderStatus;
                updateFilters({
                  ...filters,
                  page: 1,
                  status: value === '' ? undefined : value,
                });
              }}
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
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

            {hasActiveOrderListFilters(filters) ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateFilters(DEFAULT_ORDER_LIST_FILTERS)}
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
                <Label htmlFor="orders-name" className="text-xs text-muted-foreground">
                  Customer name
                </Label>
                <Input
                  id="orders-name"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  placeholder="First or last"
                  className="h-8 w-36 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-first-name" className="text-xs text-muted-foreground">
                  First name
                </Label>
                <Input
                  id="orders-first-name"
                  value={firstNameDraft}
                  onChange={(e) => setFirstNameDraft(e.target.value)}
                  className="h-8 w-32 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-last-name" className="text-xs text-muted-foreground">
                  Last name
                </Label>
                <Input
                  id="orders-last-name"
                  value={lastNameDraft}
                  onChange={(e) => setLastNameDraft(e.target.value)}
                  className="h-8 w-32 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-created-after" className="text-xs text-muted-foreground">
                  Created after
                </Label>
                <Input
                  id="orders-created-after"
                  type="date"
                  value={createdAfterDraft}
                  onChange={(e) => setCreatedAfterDraft(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-created-before" className="text-xs text-muted-foreground">
                  Created before
                </Label>
                <Input
                  id="orders-created-before"
                  type="date"
                  value={createdBeforeDraft}
                  onChange={(e) => setCreatedBeforeDraft(e.target.value)}
                  className="h-8 w-36 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-min-amount" className="text-xs text-muted-foreground">
                  Min amount
                </Label>
                <Input
                  id="orders-min-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={minAmountDraft}
                  onChange={(e) => setMinAmountDraft(e.target.value)}
                  placeholder="0.00"
                  className="h-8 w-28 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="orders-max-amount" className="text-xs text-muted-foreground">
                  Max amount
                </Label>
                <Input
                  id="orders-max-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={maxAmountDraft}
                  onChange={(e) => setMaxAmountDraft(e.target.value)}
                  placeholder="0.00"
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
        {hasActiveOrderListFilters(filters) ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-xs text-muted-foreground">Active:</span>
            {filters.userEmail ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Email: "{filters.userEmail}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, userEmail: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove email filter</span>
                </button>
              </span>
            ) : null}
            {filters.status ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Status: {ORDER_STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? filters.status}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, status: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove status filter</span>
                </button>
              </span>
            ) : null}
            {filters.userName ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Name: "{filters.userName}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, userName: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove name filter</span>
                </button>
              </span>
            ) : null}
            {filters.firstName ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                First name: "{filters.firstName}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, firstName: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove first name filter</span>
                </button>
              </span>
            ) : null}
            {filters.lastName ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Last name: "{filters.lastName}"
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, lastName: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove last name filter</span>
                </button>
              </span>
            ) : null}
            {filters.createdAfter ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                After: {filters.createdAfter}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, createdAfter: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove created after filter</span>
                </button>
              </span>
            ) : null}
            {filters.createdBefore ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Before: {filters.createdBefore}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, createdBefore: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove created before filter</span>
                </button>
              </span>
            ) : null}
            {filters.minAmount !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Min: ${filters.minAmount}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, minAmount: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove min amount filter</span>
                </button>
              </span>
            ) : null}
            {filters.maxAmount !== undefined ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                Max: ${filters.maxAmount}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, maxAmount: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove max amount filter</span>
                </button>
              </span>
            ) : null}
            {filters.userId ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
                User #{filters.userId}
                <button
                  type="button"
                  onClick={() =>
                    updateFilters({ ...filters, page: 1, userId: undefined })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove user filter</span>
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
        resource="orders"
      />

      <QueryListRegion
        isLoading={isLoading}
        isFetching={isFetching}
        loadingLabel="Loading orders…"
        hasData={Boolean(data)}
      >
        {data ? (
          <OrdersTable
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

export { OrdersPage };
export default OrdersPage;
