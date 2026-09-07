import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import {
  AuthLoadingScreen,
  AuthSessionErrorScreen,
} from '@/lib/auth/auth-loading-screen';
import { useAuth } from '@/lib/auth/auth-context';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, sessionError, retrySession } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'error') {
    return (
      <AuthSessionErrorScreen error={sessionError} onRetry={retrySession} />
    );
  }

  if (status === 'unauthenticated') {
    const redirect = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return children;
}
