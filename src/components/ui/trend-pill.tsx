import { cn } from '@/lib/utils';
import { formatPercentDelta } from '@/lib/format';

type TrendPillProps = {
  delta: number | null;
  className?: string;
};

export function TrendPill({ delta, className }: TrendPillProps) {
  if (delta === null) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground',
          className,
        )}
      >
        n/a
      </span>
    );
  }

  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
        isNeutral && 'border border-border bg-muted text-foreground',
        isPositive && 'border border-positive/20 bg-positive/10 text-positive',
        !isPositive &&
          !isNeutral &&
          'border border-negative/20 bg-negative/10 text-negative',
        className,
      )}
    >
      <span aria-hidden="true">{isPositive ? '▲' : isNeutral ? '-' : '▼'}</span>
      <span>{formatPercentDelta(delta)}</span>
    </span>
  );
}
