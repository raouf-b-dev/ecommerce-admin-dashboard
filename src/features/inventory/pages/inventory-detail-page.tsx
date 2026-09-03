import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
        <PageHeader
          title={`Product #${productId}`}
          description="No inventory record for this product yet."
        >
          <Button asChild variant="outline">
            <Link to="/inventory">Back to list</Link>
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          No inventory recorded for this product. Stock appears after seed or
          the first adjust/create inventory flow.
        </p>
      </div>
    );
  }

  const item = detailQuery.data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={item.productTitle}
        description={`SKU ${item.sku} · Product #${item.productId}`}
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/inventory">Back to list</Link>
          </Button>
          {canManage ? (
            <Button type="button" onClick={() => setDialogOpen(true)}>
              Adjust stock
            </Button>
          ) : null}
        </div>
      </PageHeader>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Available</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {item.availableQuantity}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Reserved</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {item.reservedQuantity}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {item.totalQuantity}
          </dd>
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <dt className="text-sm text-muted-foreground">Updated</dt>
          <dd className="text-sm">{formatDateTime(item.updatedAt)}</dd>
        </div>
      </dl>

      {canManage ? (
        <AdjustStockDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productTitle={item.productTitle}
          conflictMessage={conflictMessage}
          onSubmit={handleAdjust}
        />
      ) : null}
    </div>
  );
}

export { InventoryDetailPage };
export default InventoryDetailPage;
