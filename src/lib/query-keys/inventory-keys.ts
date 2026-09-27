// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: MIT

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: <TFilters>(filters: TFilters) =>
    [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: number | undefined) =>
    [...inventoryKeys.details(), id] as const,
};
