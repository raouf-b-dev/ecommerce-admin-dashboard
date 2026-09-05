import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowUpDown, Clock, Layers, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { AdjustStockDialog } from '@/features/inventory/components/adjust-stock-dialog';
import {
  useAdjustStock,
  useInventoryDetailQuery,
} from '@/features/inventory/hooks/use-inventory';
import type { AdjustStockDto } from '@/features/inventory/types';
import { useAuth } from '@/lib/auth/auth-context';
import {
  getErrorMessage,
  isOptimisticLockConflict,
} from '@/lib/api/parse-api-error';
import { formatDateTime } from '@/lib/format';
import { QueryLoading } from '@/components/feedback/query-state';

const CONFLICT_MESSAGE =
  'Stock was modified by another request. Latest values were reloaded — review and adjust again.';

function InventoryDetailPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('manage_inventory');
  const canManageProducts = hasPermission('manage_products');
  const params = useParams();
  const productId = Number(params.productId);
  const validId = Number.isFinite(productId) && productId > 0;
  const detailQuery = useInventoryDetailQuery(validId ? productId : undefined);
  const adjustStock = useAdjustStock(productId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  async function handleAdjust(body: AdjustStockDto) {
    setConflictMessage(null);
    try {
      await adjustStock.mutateAsync(body);
    } catch (error) {
      if (isOptimisticLockConflict(error)) {
        setConflictMessage(CONFLICT_MESSAGE);
        return;
      }
      throw error;
    }
  }

  if (!validId) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Invalid product</AlertTitle>
        <AlertDescription>
          The product id in the URL is not valid.
        </AlertDescription>
      </Alert>
    );
  }

  if (detailQuery.isLoading) {
    return <QueryLoading>Loading inventory…</QueryLoading>;
  }

  if (detailQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load inventory</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center gap-3">
          <span>
            {getErrorMessage(detailQuery.error, 'Failed to load inventory')}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (detailQuery.data == null) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inventory
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Product #{productId}
            </h1>
            <p className="text-sm text-muted-foreground">
              No inventory record for this product yet.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/inventory">Back to list</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          No inventory recorded for this product. Stock appears after seed or
          the first adjust/create inventory flow.
        </p>
      </div>
    );
  }

  const item = detailQuery.data;
  const defaultThreshold = 10;
  const availablePct = item.totalQuantity > 0
    ? Math.round((item.availableQuantity / item.totalQuantity) * 100)
    : 0;
  const reservedPct = item.totalQuantity > 0
    ? Math.round((item.reservedQuantity / item.totalQuantity) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="space-y-4">
        <div>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to inventory
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {item.productTitle}
              </h1>
              <StatusBadge
                variant="inventory"
                availableQuantity={item.availableQuantity}
                lowStockThreshold={defaultThreshold}
              />
              <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">
                SKU: {item.sku}
              </span>
              <span className="inline-flex items-center rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                Product #{item.productId}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time stock balance, order allocation, and threshold policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canManageProducts ? (
              <Button asChild variant="outline" size="sm">
                <Link to={`/products/${item.productId}/edit`}>Edit product</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="sm">
              <Link to="/inventory">Back to list</Link>
            </Button>
            {canManage ? (
              <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
                Adjust stock
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Available Stock
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
              {item.availableQuantity}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-muted-foreground">
            Available for immediate order allocation
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reserved Stock
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
              {item.reservedQuantity}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-muted-foreground">
            Held for unfulfilled or processing orders
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="p-5 pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total On-Hand
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-foreground">
              {item.totalQuantity}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-xs text-muted-foreground">
            Combined physical warehouse stock count
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stock Allocation & Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Stock allocation breakdown</CardTitle>
              </div>
              <CardDescription>
                Proportion of on-hand inventory allocated to pending customer orders versus available for sale.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ratio Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted flex">
                <div
                  style={{ width: `${availablePct}%` }}
                  className="bg-emerald-500 transition-all"
                  title={`Available: ${item.availableQuantity} (${availablePct}%)`}
                />
                <div
                  style={{ width: `${reservedPct}%` }}
                  className="bg-amber-500 transition-all"
                  title={`Reserved: ${item.reservedQuantity} (${reservedPct}%)`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Available:</span>{' '}
                    <span className="tabular-nums font-semibold">{item.availableQuantity}</span>{' '}
                    <span className="text-xs text-muted-foreground">({availablePct}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Reserved:</span>{' '}
                    <span className="tabular-nums font-semibold">{item.reservedQuantity}</span>{' '}
                    <span className="text-xs text-muted-foreground">({reservedPct}%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threshold & Safety Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Replenishment policy & thresholds</CardTitle>
              </div>
              <CardDescription>
                Automatic warning criteria for low stock and inventory alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5 text-sm">
                <span className="text-muted-foreground">Low stock threshold</span>
                <span className="font-semibold text-foreground">{defaultThreshold} units</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2.5 text-sm">
                <span className="text-muted-foreground">Threshold alert status</span>
                {item.availableQuantity <= defaultThreshold ? (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    Low stock trigger active
                  </span>
                ) : (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Adequate stock level
                  </span>
                )}
              </div>
              <p className="pt-1 text-xs text-muted-foreground">
                When available quantity reaches or falls below {defaultThreshold} units, real-time alerts fire to subscribed operators and the item appears in low-stock cockpit dashboards.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3) */}
        <div className="space-y-6">
          {/* Inventory Metadata Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Inventory metadata</CardTitle>
              </div>
              <CardDescription>
                System timestamps and tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Product ID</dt>
                  <dd className="font-mono text-xs font-semibold text-foreground">#{item.productId}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">SKU</dt>
                  <dd className="font-mono text-xs font-medium text-foreground">{item.sku}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-muted-foreground">Last updated</dt>
                  <dd className="text-xs text-foreground">{formatDateTime(item.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quick Adjustment Card */}
          {canManage ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Stock operations</CardTitle>
                </div>
                <CardDescription>
                  Perform audited stock adjustments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Update inventory counts using additive restocks, physical damage subtractions, or cycle count overrides.
                </p>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setDialogOpen(true)}
                >
                  Adjust stock
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {canManage ? (
        <AdjustStockDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productTitle={item.productTitle}
          availableQuantity={item.availableQuantity}
          conflictMessage={conflictMessage}
          onSubmit={handleAdjust}
        />
      ) : null}
    </div>
  );
}

export { InventoryDetailPage };
export default InventoryDetailPage;
