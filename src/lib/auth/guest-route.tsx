// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { Navigate, useSearchParams } from 'react-router';
import type { ReactNode } from 'react';
import {
  AuthLoadingScreen,
  AuthSessionErrorScreen,
} from '@/lib/auth/auth-loading-screen';
import { useAuth } from '@/lib/auth/auth-context';
import { safeRedirectPath } from '@/lib/auth/safe-redirect-path';

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
