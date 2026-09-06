import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/lib/auth/auth-context';
import { getDefaultLandingRoute } from '@/lib/auth/safe-landing';

type IndexLandingGateProps = {
  children: ReactNode;
};

export function IndexLandingGate({ children }: IndexLandingGateProps) {
  const { session, hasPermission } = useAuth();

  if (hasPermission('view_all_orders')) {
    return children;
  }

  const destination = getDefaultLandingRoute(session?.permissions ?? []);
  return <Navigate to={destination} replace />;
}
