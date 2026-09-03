import type { AuthSession } from '@/features/auth/types';
import { safeRedirectPath } from '@/features/auth/lib/safe-redirect-path';

/** Destination after a successful login / demo login. */
export function navigateAfterLoginPath(
  session: AuthSession,
  redirectQuery: string | null,
): string {
  if (session.mustChangePassword) {
    return '/change-password';
  }

  return safeRedirectPath(redirectQuery);
}
