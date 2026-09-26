// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { navigation } from '@/app/navigation';
import { hasPermission } from '@/lib/auth/permissions';

/**
 * Returns the safest default landing route for an operator based on granted claims.
 * If the operator has permission to view orders, dashboard ('/') is returned.
 * Otherwise, the first permitted navigation route is returned to prevent redirect loops.
 */
export function getDefaultLandingRoute(permissions: readonly string[]): string {
  if (hasPermission(permissions, 'view_all_orders')) {
    return '/';
  }

  for (const item of navigation) {
    if (item.to !== '/' && hasPermission(permissions, item.permission)) {
      return item.to;
    }
  }

  return '/login';
}
