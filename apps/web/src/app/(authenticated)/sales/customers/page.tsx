import { Suspense } from 'react';
import Link from 'next/link';
import { PartnersTable } from '@web/components/partners/partners-table';
import { Skeleton } from '@web/components/ui/skeleton';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';

export const metadata = {
  title: 'Customers | GrowFlow',
  description: 'Manage customers directly from Sales module.',
};

export default function SalesCustomersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Customers</h1>
          <p className="text-muted-foreground text-sm">
            Manage your sales customers and business contacts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href={`/partners/new?from=${encodeURIComponent('/sales/customers')}`}>
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Customer
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PartnersTable fixedType="CUSTOMER" />
      </Suspense>
    </div>
  );
}
