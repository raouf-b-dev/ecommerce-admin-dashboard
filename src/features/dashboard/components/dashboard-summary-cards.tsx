import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendPill } from '@/components/ui/trend-pill';
import type { AnalyticsKpiSnapshotDto } from '@/features/dashboard/types';
import { formatMoney } from '@/lib/format';
import {
  calculateRefundRate,
  formatPercent,
  percentChange,
} from '@/features/dashboard/lib/dashboard-metrics';

type KpiCardProps = {
  title: string;
  value: string;
  delta?: number | null;
  detail?: string;
  hint?: string;
};

function KpiCard({ title, value, delta, detail, hint }: KpiCardProps) {
  return (
    <Card className="border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </CardDescription>
          {delta !== undefined ? <TrendPill delta={delta} /> : null}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        {detail ? (
          <p className="font-medium text-foreground/90">{detail}</p>
        ) : null}
        {hint ? <p className="text-muted-foreground/80">{hint}</p> : null}
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
  const refundRate = calculateRefundRate(
    current.refundedAmount,
    current.grossRevenue,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Net revenue"
        value={formatMoney(current.netRevenue, current.currency)}
        delta={percentChange(current.netRevenue, previous.netRevenue)}
        detail={`Gross: ${formatMoney(current.grossRevenue, current.currency)}`}
        hint={`Refunds: ${formatPercent(refundRate)} (${formatMoney(current.refundedAmount, current.currency)})`}
      />
      <KpiCard
        title="Orders"
        value={String(current.ordersCount)}
        delta={percentChange(current.ordersCount, previous.ordersCount)}
        detail={`${current.paidOrderCount} paid payments`}
        hint="Created in selected period"
      />
      <KpiCard
        title="AOV"
        value={formatMoney(current.aov, current.currency)}
        delta={percentChange(current.aov, previous.aov)}
        detail="Net revenue ÷ paid payments"
        hint="Average value per captured order"
      />
      {showLowStock ? (
        <KpiCard
          title="Low stock"
          value={String(lowStockCount)}
          detail="SKUs at or below threshold"
          hint="Requires inventory replenishment"
        />
      ) : null}
    </div>
  );
}
