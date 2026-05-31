import Link from 'next/link';
import { Suspense } from 'react';
import { GoodsReceiptsTable } from '@web/components/purchasing/goods-receipts/goods-receipts-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Goods Receipts | GrowFlow',
  description: 'Manage Goods Receipts (GRN).',
};

export default function GoodsReceiptsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Goods Receipts (GRN)</h1>
          <p className="text-muted-foreground text-sm">
            Track incoming shipments, verify physical items and update inventory stock balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/purchasing/goods-receipts/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                New Goods Receipt
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <GoodsReceiptsTable />
      </Suspense>
    </div>
  );
}

