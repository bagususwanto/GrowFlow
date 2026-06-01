import { Suspense } from 'react';
import { PartnersTable } from '@web/components/partners/partners-table';
import { Skeleton } from '@web/components/ui/skeleton';

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
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PartnersTable fixedType="CUSTOMER" />
      </Suspense>
    </div>
  );
}
