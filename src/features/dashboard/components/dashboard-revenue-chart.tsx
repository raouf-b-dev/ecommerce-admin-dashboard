import { useState } from 'react';
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
import { formatMoney } from '@/lib/format';
import { SegmentedControl } from '@/components/ui/segmented-control';

export type ChartMetric =
  | 'netAmount'
  | 'grossAmount'
  | 'refundedAmount'
  | 'capturedCount';

type Props = {
  buckets: PaymentTimeSeriesBucketDto[];
  currency: string;
  bucket?: 'day' | 'week';
  metric?: ChartMetric;
  onMetricChange?: (metric: ChartMetric) => void;
};

export const METRIC_OPTIONS = [
  { value: 'netAmount' as const, label: 'Net revenue' },
  { value: 'grossAmount' as const, label: 'Gross revenue' },
  { value: 'refundedAmount' as const, label: 'Refunds' },
  { value: 'capturedCount' as const, label: 'Captured payments' },
];

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
  metric: controlledMetric,
  onMetricChange,
}: Props) {
  const [internalMetric, setInternalMetric] = useState<ChartMetric>('netAmount');
  const metric = controlledMetric ?? internalMetric;
  const setMetric = onMetricChange ?? setInternalMetric;

  const data = buckets.map((row) => ({
    ...row,
    label: formatBucketLabel(row.bucketStart, bucket),
  }));

  const activeOption = METRIC_OPTIONS.find((opt) => opt.value === metric)!;
  const isCountMetric = metric === 'capturedCount';
  const allZero = data.every((row) => row[metric] === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <SegmentedControl
          size="sm"
          options={METRIC_OPTIONS}
          value={metric}
          onChange={setMetric}
          ariaLabel="Chart metric switcher"
        />
      </div>

      {allZero ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {metric === 'netAmount'
            ? 'No captured revenue in this period.'
            : `No ${activeOption.label.toLowerCase()} in this period.`}
        </p>
      ) : (
        <div
          className="h-64 sm:h-72 w-full"
          role="img"
          aria-label={`${activeOption.label} over time`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartMetricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/70" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                width={isCountMetric ? 40 : 64}
                tickFormatter={(value: number) =>
                  isCountMetric
                    ? String(value)
                    : formatMoney(value, currency).replace(/\.00$/, '')
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  isCountMetric
                    ? String(value)
                    : formatMoney(value, currency),
                  activeOption.label,
                ]}
                labelFormatter={(label) => String(label)}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="hsl(var(--primary))"
                fill="url(#chartMetricGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
