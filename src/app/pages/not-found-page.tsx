// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { PageHeader } from '@/components/layout/page-header';

export function NotFoundPage() {
  return (
    <PageHeader
      title="Not Found"
      description="The requested page does not exist."
    />
  );
}
