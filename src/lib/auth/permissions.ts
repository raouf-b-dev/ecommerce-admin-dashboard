// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { NavItem } from '@/app/navigation';

export function hasPermission(
  permissions: readonly string[],
  permission?: string,
): boolean {
  if (!permission) {
    return true;
  }

  return permissions.includes(permission);
}

export function filterNavigation(
  items: NavItem[],
  permissions: readonly string[],
): NavItem[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}
