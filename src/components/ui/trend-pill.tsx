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
          'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground bg-muted',
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
        isNeutral && 'bg-muted text-muted-foreground',
        isPositive &&
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        !isPositive &&
          !isNeutral &&
          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
        className,
      )}
    >
      <span aria-hidden="true">{isPositive ? '▲' : isNeutral ? '—' : '▼'}</span>
      <span>{formatPercentDelta(delta)}</span>
    </span>
  );
}
