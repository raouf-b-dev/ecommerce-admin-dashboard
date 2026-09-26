// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { OperatorSetupStepView } from '@/lib/operator-setup';

type OperatorSetupChecklistProps = {
  steps: OperatorSetupStepView[];
  heading?: string;
};

export function OperatorSetupChecklist({
  steps,
  heading = 'First-time operator setup',
}: OperatorSetupChecklistProps) {
  return (
    <div className="mx-auto max-w-lg py-4 text-left">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{heading}</h3>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="flex gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
              {step.statusLabel ? (
                <p className="text-xs font-medium text-muted-foreground">
                  {step.statusLabel}
                </p>
              ) : null}
              {step.status === 'ready' && step.href ? (
                <Button variant="outline" size="sm" asChild className="mt-1">
                  <Link to={step.href}>Open</Link>
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
