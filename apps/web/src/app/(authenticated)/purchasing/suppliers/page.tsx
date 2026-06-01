import { Suspense } from 'react';
import Link from 'next/link';
import { PartnersTable } from '@web/components/partners/partners-table';
import { Skeleton } from '@web/components/ui/skeleton';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';

export const metadata = {
  title: 'Suppliers | GrowFlow',
  description: 'Manage suppliers directly from Purchasing module.',
};

export default function PurchasingSuppliersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your purchasing suppliers and supply chain contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href={`/partners/new?from=${encodeURIComponent('/purchasing/suppliers')}`}>
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Supplier
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PartnersTable fixedType="SUPPLIER" />
      </Suspense>
    </div>
  );
}
