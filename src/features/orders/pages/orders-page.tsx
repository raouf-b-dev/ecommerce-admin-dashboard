import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
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

  function updateFilters(next: OrderListFilters) {
    setSearchParams(orderListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: FormEvent) {
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
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Inspect orders and run allowed status transitions."
      />

      <div className="flex flex-wrap items-end gap-4">
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={applyTextFilters}
        >
          <div className="space-y-2">
            <Label htmlFor="orders-email">Customer email</Label>
            <Input
              id="orders-email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="Filter by email"
              className="w-48"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-name">Customer name</Label>
            <Input
              id="orders-name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="First or last"
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-first-name">First name</Label>
            <Input
              id="orders-first-name"
              value={firstNameDraft}
              onChange={(e) => setFirstNameDraft(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-last-name">Last name</Label>
            <Input
              id="orders-last-name"
              value={lastNameDraft}
              onChange={(e) => setLastNameDraft(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-created-after">Created after</Label>
            <Input
              id="orders-created-after"
              type="date"
              value={createdAfterDraft}
              onChange={(e) => setCreatedAfterDraft(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-created-before">Created before</Label>
            <Input
              id="orders-created-before"
              type="date"
              value={createdBeforeDraft}
              onChange={(e) => setCreatedBeforeDraft(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-min-amount">Min amount</Label>
            <Input
              id="orders-min-amount"
              type="number"
              min={0}
              step="0.01"
              value={minAmountDraft}
              onChange={(e) => setMinAmountDraft(e.target.value)}
              className="w-28"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-max-amount">Max amount</Label>
            <Input
              id="orders-max-amount"
              type="number"
              min={0}
              step="0.01"
              value={maxAmountDraft}
              onChange={(e) => setMaxAmountDraft(e.target.value)}
              className="w-28"
            />
          </div>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
        </form>

        <div className="space-y-2">
          <Label htmlFor="orders-status">Status</Label>
          <select
            id="orders-status"
            className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        </div>

        {hasActiveOrderListFilters(filters) ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => updateFilters(DEFAULT_ORDER_LIST_FILTERS)}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {filters.userId ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            Filtered by user #{filters.userId}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              updateFilters({
                ...filters,
                page: 1,
                userId: undefined,
              })
            }
          >
            Clear user filter
          </Button>
        </div>
      ) : null}

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
