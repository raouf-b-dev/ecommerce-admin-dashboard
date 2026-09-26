// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from 'react';
import { ACCESS_ADMIN_PERMISSION } from '@/lib/auth/admin-access';
import { OperatorDeniedPage } from '@/lib/auth/operator-denied-page';
import { useAuth } from '@/lib/auth/auth-context';

type OperatorRouteProps = {
  children: ReactNode;
};

/** Shell gate: requires API `access_admin` permission (UX-only; API remains authoritative). */
export function OperatorRoute({ children }: OperatorRouteProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(ACCESS_ADMIN_PERMISSION)) {
    return <OperatorDeniedPage />;
  }

  return children;
}
