import type {
  ListOrdersQuery,
  OrderListFilters,
  OrderStatus,
} from '@/features/orders/types';

export const DEFAULT_ORDER_LIST_FILTERS: OrderListFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const ORDER_STATUSES = [
  'pending_payment',
  'payment_failed',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const satisfies readonly OrderStatus[];

export const ORDER_STATUS_OPTIONS: {
  value: '' | OrderStatus;
  label: string;
}[] = [
  { value: '', label: 'All statuses' },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: status.replaceAll('_', ' '),
  })),
];

const ORDER_SORT_BY = [
  'createdAt',
  'updatedAt',
  'totalPrice',
] as const satisfies readonly NonNullable<ListOrdersQuery['sortBy']>[];

const SORT_ORDERS = [
  'asc',
  'desc',
] as const satisfies readonly NonNullable<ListOrdersQuery['sortOrder']>[];

function isOrderStatus(value: string | null): value is OrderStatus {
  return value !== null && (ORDER_STATUSES as readonly string[]).includes(value);
}

function isOrderSortBy(
  value: string | null,
): value is NonNullable<ListOrdersQuery['sortBy']> {
  return (
    value !== null && (ORDER_SORT_BY as readonly string[]).includes(value)
  );
}

function isSortOrder(
  value: string | null,
): value is NonNullable<ListOrdersQuery['sortOrder']> {
  return value !== null && (SORT_ORDERS as readonly string[]).includes(value);
}

export function normalizeOrderListFilters(
  input: Partial<OrderListFilters> = {},
): OrderListFilters {
  return {
    page:
      input.page && input.page > 0
        ? input.page
        : DEFAULT_ORDER_LIST_FILTERS.page,
    limit:
      input.limit && input.limit > 0
        ? input.limit
        : DEFAULT_ORDER_LIST_FILTERS.limit,
    sortBy: input.sortBy ?? DEFAULT_ORDER_LIST_FILTERS.sortBy,
    sortOrder: input.sortOrder ?? DEFAULT_ORDER_LIST_FILTERS.sortOrder,
    status: input.status,
    userId:
      typeof input.userId === 'number' &&
      Number.isInteger(input.userId) &&
      input.userId > 0
        ? input.userId
        : undefined,
    userEmail: input.userEmail?.trim() ? input.userEmail.trim() : undefined,
    userName: input.userName?.trim() ? input.userName.trim() : undefined,
  };
}

export function orderListFiltersFromSearchParams(
  params: URLSearchParams,
): OrderListFilters {
  const page = Number(params.get('page') ?? '');
  const limit = Number(params.get('limit') ?? '');
  const sortBy = params.get('sortBy');
  const sortOrder = params.get('sortOrder');
  const status = params.get('status');
  const userId = Number(params.get('userId') ?? '');
  const userEmail = params.get('userEmail') ?? undefined;
  const userName = params.get('userName') ?? undefined;

  return normalizeOrderListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    sortBy: isOrderSortBy(sortBy) ? sortBy : undefined,
    sortOrder: isSortOrder(sortOrder) ? sortOrder : undefined,
    status: isOrderStatus(status) ? status : undefined,
    userId: Number.isInteger(userId) && userId > 0 ? userId : undefined,
    userEmail,
    userName,
  });
}

export function orderListFiltersToSearchParams(
  filters: OrderListFilters,
): URLSearchParams {
  const normalized = normalizeOrderListFilters(filters);
  const params = new URLSearchParams();

  if (normalized.page !== DEFAULT_ORDER_LIST_FILTERS.page) {
    params.set('page', String(normalized.page));
  }
  if (normalized.limit !== DEFAULT_ORDER_LIST_FILTERS.limit) {
    params.set('limit', String(normalized.limit));
  }
  if (normalized.sortBy !== DEFAULT_ORDER_LIST_FILTERS.sortBy) {
    params.set('sortBy', normalized.sortBy);
  }
  if (normalized.sortOrder !== DEFAULT_ORDER_LIST_FILTERS.sortOrder) {
    params.set('sortOrder', normalized.sortOrder);
  }
  if (normalized.status) {
    params.set('status', normalized.status);
  }
  if (normalized.userId) {
    params.set('userId', String(normalized.userId));
  }
  if (normalized.userEmail) {
    params.set('userEmail', normalized.userEmail);
  }
  if (normalized.userName) {
    params.set('userName', normalized.userName);
  }

  return params;
}
