import type { AuthSession } from '@/features/auth/types';
import { safeRedirectPath } from '@/features/auth/lib/safe-redirect-path';
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
