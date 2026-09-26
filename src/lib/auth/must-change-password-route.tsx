// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

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
  const { session } = useAuth();

  if (session && !session.mustChangePassword) {
    return <Navigate to="/" replace />;
  }

  return children;
}
