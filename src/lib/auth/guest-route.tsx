import { Navigate, useSearchParams } from 'react-router';
import type { ReactNode } from 'react';
import { safeRedirectPath } from '@/features/auth/lib/safe-redirect-path';
import {
  AuthLoadingScreen,
  AuthSessionErrorScreen,
} from '@/lib/auth/auth-loading-screen';
import { useAuth } from '@/lib/auth/auth-context';

type GuestRouteProps = {
  children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
  const { status, mustChangePassword, sessionError, retrySession } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'error') {
    return (
      <AuthSessionErrorScreen error={sessionError} onRetry={retrySession} />
    );
  }

  if (status === 'authenticated') {
    if (mustChangePassword) {
      return <Navigate to="/change-password" replace />;
    }

    const redirect = safeRedirectPath(searchParams.get('redirect'));
    return <Navigate to={redirect} replace />;
  }

  return children;
}
