import type { components, operations } from '@/lib/api/generated/schema';

export type OrderListItemResponseDto =
  components['schemas']['OrderListItemResponseDto'];
export type PaginatedOrdersResponseDto =
  components['schemas']['PaginatedOrdersResponseDto'];
export type OrderDetailResponseDto =
  components['schemas']['OrderDetailResponseDto'];
export type OrderMutationResponseDto =
  components['schemas']['OrderMutationResponseDto'];
export type PaymentDetailResponseDto =
  components['schemas']['PaymentDetailResponseDto'];

export type ListOrdersQuery = NonNullable<
  operations['OrdersController_findAll_v1']['parameters']['query']
>;

export type OrderStatus = NonNullable<ListOrdersQuery['status']>;

export type OrderListFilters = {
  page: number;
  limit: number;
  sortBy: NonNullable<ListOrdersQuery['sortBy']>;
  sortOrder: NonNullable<ListOrdersQuery['sortOrder']>;
  status?: OrderStatus;
  userEmail?: string;
  userName?: string;
};

export type OrderStatusAction =
  | 'confirm'
  | 'process'
  | 'ship'
  | 'deliver'
  | 'cancel';
