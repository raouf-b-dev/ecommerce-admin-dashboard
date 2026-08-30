import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AnalyticsKpiSnapshotDto } from '@/features/dashboard/types';
import {
  formatMoney,
  formatPercentDelta,
  percentChange,
} from '@/features/dashboard/lib/dashboard-metrics';

type KpiCardProps = {
  title: string;
  value: string;
  delta: number | null;
  hint?: string;
};

function KpiCard({ title, value, delta, hint }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <span className="tabular-nums">{formatPercentDelta(delta)}</span>
        {hint ? <span> vs prior period</span> : null}
        {hint ? <p className="mt-1 text-xs">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

type Props = {
  current: AnalyticsKpiSnapshotDto;
  previous: AnalyticsKpiSnapshotDto;
  lowStockCount: number;
  showLowStock: boolean;
};

export function DashboardSummaryCards({
  current,
  previous,
  lowStockCount,
  showLowStock,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Net revenue"
        value={formatMoney(current.netRevenue, current.currency)}
        delta={percentChange(current.netRevenue, previous.netRevenue)}
        hint="Successful payments − refunds"
      />
      <KpiCard
        title="Orders"
        value={String(current.ordersCount)}
        delta={percentChange(current.ordersCount, previous.ordersCount)}
      />
      <KpiCard
        title="AOV"
        value={formatMoney(current.aov, current.currency)}
        delta={percentChange(current.aov, previous.aov)}
        hint="Net ÷ paid payments"
      />
      {showLowStock ? (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low stock</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {lowStockCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            SKUs at or below threshold
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
