import type { components, operations } from '@/lib/api/generated/schema';

export type InventoryListItemResponseDto =
  components['schemas']['InventoryListItemResponseDto'];
export type PaginatedInventoryResponseDto =
  components['schemas']['PaginatedInventoryResponseDto'];
export type InventoryStockResponseDto =
  components['schemas']['InventoryStockResponseDto'];
export type AdjustStockDto = components['schemas']['AdjustStockDto'];

export type ListInventoryQuery = NonNullable<
  operations['InventoryController_findAll_v1']['parameters']['query']
>;

export type InventoryListFilters = {
  page: number;
  limit: number;
  sortBy: NonNullable<ListInventoryQuery['sortBy']>;
  sortOrder: NonNullable<ListInventoryQuery['sortOrder']>;
  sku?: string;
  productTitle?: string;
  lowStockOnly?: boolean;
};
