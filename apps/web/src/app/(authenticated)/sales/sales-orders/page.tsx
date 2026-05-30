import Link from 'next/link';
import { Suspense } from 'react';
import { SalesOrdersTable } from '@web/components/sales/sales-orders/sales-orders-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Sales Orders | GrowFlow',
  description: 'Manage Sales Orders.',
};

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground text-sm">
            Buat, konfirmasi, dan kelola transaksi pesanan penjualan barang dengan customer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/sales/sales-orders/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                New Sales Order
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <SalesOrdersTable />
      </Suspense>
    </div>
  );
}
