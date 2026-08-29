import { Navigate, useSearchParams } from 'react-router';
import type { ReactNode } from 'react';
import { AuthLoadingScreen } from '@/lib/auth/auth-loading-screen';
import { useAuth } from '@/lib/auth/auth-context';

type GuestRouteProps = {
  children: ReactNode;
};

function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  if (value.startsWith('/login')) {
    return '/';
  }

  return value;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { status, mustChangePassword } = useAuth();
  const [searchParams] = useSearchParams();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
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
