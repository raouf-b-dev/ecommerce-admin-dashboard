import { Navigate } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

type RequirePasswordChangedProps = {
  children: ReactNode;
};

export function RequirePasswordChanged({ children }: RequirePasswordChangedProps) {
  const { session } = useAuth();

  if (session?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

type ChangePasswordRouteProps = {
  children: ReactNode;
};

export function ChangePasswordRoute({ children }: ChangePasswordRouteProps) {
  const { session, hasPermission } = useAuth();

  const canChangePassword =
    Boolean(session?.mustChangePassword) ||
    hasPermission('change_own_credentials');

  if (session && !canChangePassword) {
    return <Navigate to="/" replace />;
  }

  return children;
}
