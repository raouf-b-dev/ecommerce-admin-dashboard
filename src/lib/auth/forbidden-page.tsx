// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { getDefaultLandingRoute } from '@/lib/auth/safe-landing';

export function ForbiddenPage() {
  const { session } = useAuth();
  const safeLandingRoute = session?.permissions
    ? getDefaultLandingRoute(session.permissions)
    : '/';
  const ctaLabel =
    safeLandingRoute === '/' ? 'Back to dashboard' : 'Back to home';

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title="Access denied"
        description="You do not have permission to view this page. Contact an administrator if you believe this is an error."
      />
      <Button asChild variant="outline">
        <Link to={safeLandingRoute}>{ctaLabel}</Link>
      </Button>
    </div>
  );
}
