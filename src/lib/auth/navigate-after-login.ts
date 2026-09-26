// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { AuthSession } from '@/lib/auth/types';
import { safeRedirectPath } from '@/lib/auth/safe-redirect-path';
import { getDefaultLandingRoute } from '@/lib/auth/safe-landing';

/** Destination after a successful login / demo login. */
export function navigateAfterLoginPath(
  session: AuthSession,
  redirectQuery: string | null,
): string {
  if (session.mustChangePassword) {
    return '/change-password';
  }

  const rawPath = safeRedirectPath(redirectQuery);
  if (rawPath === '/') {
    return getDefaultLandingRoute(session.permissions);
  }

  return rawPath;
}
