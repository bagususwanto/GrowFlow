import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@web/components/ui/skeleton';
import { DeliveryNotesTable } from '@web/components/sales/delivery-notes/delivery-notes-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';

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
            Manage delivery note documents for goods shipped to customers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/sales/delivery-notes/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                New Delivery Note
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <DeliveryNotesTable />
      </Suspense>
    </div>
  );
}
