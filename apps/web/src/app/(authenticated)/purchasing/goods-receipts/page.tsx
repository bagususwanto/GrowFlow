import { Suspense } from 'react';
import { GoodsReceiptsTable } from '@web/components/purchasing/goods-receipts/goods-receipts-table';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Goods Receipts | GrowFlow',
  description: 'Manage Goods Receipts (GRN).',
};

export default function GoodsReceiptsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground text-2xl tracking-tight">Goods Receipts (GRN)</h1>
        <p className="text-muted-foreground text-sm">
          Track incoming shipments, verify physical items and update inventory stock balances.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <GoodsReceiptsTable />
      </Suspense>
    </div>
  );
}
