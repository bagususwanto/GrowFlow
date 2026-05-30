import Link from 'next/link';
import { Suspense } from 'react';
import { PurchaseOrdersTable } from '@web/components/purchasing/purchase-orders/purchase-orders-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Purchase Orders | GrowFlow',
  description: 'Manage Purchase Orders.',
};

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm">
            Create, approve, and track purchase transactions with suppliers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/purchasing/purchase-orders/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                New Purchase Order
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PurchaseOrdersTable />
      </Suspense>
    </div>
  );
}
