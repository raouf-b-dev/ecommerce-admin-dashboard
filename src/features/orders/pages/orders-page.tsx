import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrdersTable } from '@/features/orders/components/orders-table';
import { useOrdersListQuery } from '@/features/orders/hooks/use-orders';
import {
  orderListFiltersFromSearchParams,
  orderListFiltersToSearchParams,
} from '@/features/orders/lib/order-list-filters';
import type {
  OrderListFilters,
  OrderStatus,
} from '@/features/orders/types';

const STATUS_OPTIONS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending_payment', label: 'Pending payment' },
  { value: 'payment_failed', label: 'Payment failed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = orderListFiltersFromSearchParams(searchParams);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useOrdersListQuery(filters);

  const [emailDraft, setEmailDraft] = useState(filters.userEmail ?? '');
  const [nameDraft, setNameDraft] = useState(filters.userName ?? '');

  function updateFilters(next: OrderListFilters) {
    setSearchParams(orderListFiltersToSearchParams(next), { replace: true });
  }

  function applyTextFilters(event: FormEvent) {
    event.preventDefault();
    updateFilters({
      ...filters,
      page: 1,
      userEmail: emailDraft.trim() || undefined,
      userName: nameDraft.trim() || undefined,
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
              className="w-56"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orders-name">Customer name</Label>
            <Input
              id="orders-name"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Filter by name"
              className="w-44"
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
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError && !data ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load orders</AlertTitle>
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
          <AlertTitle>Could not refresh orders</AlertTitle>
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
        <p className="text-sm text-muted-foreground">Loading orders…</p>
      ) : data ? (
        <div
          className={isFetching ? 'opacity-70 transition-opacity' : undefined}
        >
          <OrdersTable
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
