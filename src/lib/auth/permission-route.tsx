// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from 'react';
import { ForbiddenPage } from '@/lib/auth/forbidden-page';
import { useAuth } from '@/lib/auth/auth-context';

type PermissionRouteProps = {
  permission: string;
  children: ReactNode;
};

export function PermissionRoute({ permission, children }: PermissionRouteProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <ForbiddenPage />;
  }

  return children;
}
