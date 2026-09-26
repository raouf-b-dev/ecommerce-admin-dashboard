// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from 'react';

type TableEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function TableEmptyState({
  title,
  description,
  action,
}: TableEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
