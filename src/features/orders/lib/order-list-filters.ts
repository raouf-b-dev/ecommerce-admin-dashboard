import type {
  ListOrdersQuery,
  OrderListFilters,
  OrderStatus,
} from '@/features/orders/types';
import {
  parseNonNegativeNumber,
  parsePositiveInt,
  toApiDateStart,
} from '@/lib/list-filters';

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

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

function normalizeDateParam(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return trimmed;
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
    userId: parsePositiveInt(input.userId),
    userEmail: input.userEmail?.trim() ? input.userEmail.trim() : undefined,
    userName: input.userName?.trim() ? input.userName.trim() : undefined,
    firstName: input.firstName?.trim() ? input.firstName.trim() : undefined,
    lastName: input.lastName?.trim() ? input.lastName.trim() : undefined,
    createdAfter: normalizeDateParam(input.createdAfter),
    createdBefore: normalizeDateParam(input.createdBefore),
    minAmount: parseNonNegativeNumber(input.minAmount),
    maxAmount: parseNonNegativeNumber(input.maxAmount),
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
  const minAmountParam = params.get('minAmount');
  const maxAmountParam = params.get('maxAmount');

  return normalizeOrderListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    sortBy: isOrderSortBy(sortBy) ? sortBy : undefined,
    sortOrder: isSortOrder(sortOrder) ? sortOrder : undefined,
    status: isOrderStatus(status) ? status : undefined,
    userId: Number.isInteger(userId) && userId > 0 ? userId : undefined,
    userEmail: params.get('userEmail') ?? undefined,
    userName: params.get('userName') ?? undefined,
    firstName: params.get('firstName') ?? undefined,
    lastName: params.get('lastName') ?? undefined,
    createdAfter: params.get('createdAfter') ?? undefined,
    createdBefore: params.get('createdBefore') ?? undefined,
    minAmount:
      minAmountParam !== null && minAmountParam !== ''
        ? Number(minAmountParam)
        : undefined,
    maxAmount:
      maxAmountParam !== null && maxAmountParam !== ''
        ? Number(maxAmountParam)
        : undefined,
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
  if (normalized.firstName) {
    params.set('firstName', normalized.firstName);
  }
  if (normalized.lastName) {
    params.set('lastName', normalized.lastName);
  }
  if (normalized.createdAfter) {
    params.set('createdAfter', normalized.createdAfter);
  }
  if (normalized.createdBefore) {
    params.set('createdBefore', normalized.createdBefore);
  }
  if (normalized.minAmount !== undefined) {
    params.set('minAmount', String(normalized.minAmount));
  }
  if (normalized.maxAmount !== undefined) {
    params.set('maxAmount', String(normalized.maxAmount));
  }

  return params;
}

export function hasActiveOrderListFilters(filters: OrderListFilters): boolean {
  const normalized = normalizeOrderListFilters(filters);
  return Boolean(
    normalized.status ||
      normalized.userId ||
      normalized.userEmail ||
      normalized.userName ||
      normalized.firstName ||
      normalized.lastName ||
      normalized.createdAfter ||
      normalized.createdBefore ||
      normalized.minAmount !== undefined ||
      normalized.maxAmount !== undefined,
  );
}

export function toOrdersListQuery(filters: OrderListFilters): ListOrdersQuery {
  const normalized = normalizeOrderListFilters(filters);
  return {
    page: normalized.page,
    limit: normalized.limit,
    sortBy: normalized.sortBy,
    sortOrder: normalized.sortOrder,
    ...(normalized.status ? { status: normalized.status } : {}),
    ...(normalized.userId ? { userId: normalized.userId } : {}),
    ...(normalized.userEmail ? { userEmail: normalized.userEmail } : {}),
    ...(normalized.userName ? { userName: normalized.userName } : {}),
    ...(normalized.firstName ? { firstName: normalized.firstName } : {}),
    ...(normalized.lastName ? { lastName: normalized.lastName } : {}),
    ...(normalized.createdAfter
      ? { createdAfter: toApiDateStart(normalized.createdAfter) }
      : {}),
    ...(normalized.createdBefore
      ? { createdBefore: normalized.createdBefore }
      : {}),
    ...(normalized.minAmount !== undefined
      ? { minAmount: normalized.minAmount }
      : {}),
    ...(normalized.maxAmount !== undefined
      ? { maxAmount: normalized.maxAmount }
      : {}),
  };
}
