import { Suspense } from 'react';
import { Skeleton } from '@web/components/ui/skeleton';
import { DeliveryNotesTable } from '@web/components/sales/delivery-notes/delivery-notes-table';

export const metadata = {
  title: 'Delivery Notes | GrowFlow',
  description: 'Manage Delivery Notes.',
};

export default function DeliveryNotesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Delivery Notes</h1>
          <p className="text-muted-foreground text-sm">
            Kelola dokumen surat jalan pengiriman barang (Delivery Notes) ke customer.
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <DeliveryNotesTable />
      </Suspense>
    </div>
  );
}
