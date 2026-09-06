import type { ReactNode } from 'react';
import { ACCESS_ADMIN_PERMISSION } from '@/features/auth/constants/admin-access';
import { OperatorDeniedPage } from '@/features/auth/pages/operator-denied-page';
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
