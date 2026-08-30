import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PaymentTimeSeriesBucketDto } from '@/features/dashboard/types';
import { formatMoney } from '@/features/dashboard/lib/dashboard-metrics';

type Props = {
  buckets: PaymentTimeSeriesBucketDto[];
  currency: string;
  bucket?: 'day' | 'week';
};

function formatBucketLabel(iso: string, mode: 'day' | 'week'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  if (mode === 'week') {
    return `W/c ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })}`;
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function DashboardRevenueChart({
  buckets,
  currency,
  bucket = 'day',
}: Props) {
  const data = buckets.map((row) => ({
    ...row,
    label: formatBucketLabel(row.bucketStart, bucket),
  }));

  if (data.every((row) => row.netAmount === 0)) {
    return (
      <p className="text-sm text-muted-foreground">
        No captured revenue in this period.
      </p>
    );
  }

  return (
    <div className="h-72 w-full" role="img" aria-label="Net revenue over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            width={64}
            tickFormatter={(value: number) =>
              formatMoney(value, currency).replace(/\.00$/, '')
            }
          />
          <Tooltip
            formatter={(value: number) => [
              formatMoney(value, currency),
              'Net revenue',
            ]}
            labelFormatter={(label) => String(label)}
          />
          <Area
            type="monotone"
            dataKey="netAmount"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.15)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
