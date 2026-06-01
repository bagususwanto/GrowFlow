import { Suspense } from 'react';
import { Skeleton } from '@web/components/ui/skeleton';
import { SalesInvoicesTable } from './invoices-table';

export const metadata = {
  title: 'Sales Invoices | GrowFlow',
  description: 'Manage Sales Invoices.',
};

export default function SalesInvoicesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Sales Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Monitor billing statements, customer payments, credit adjustments, and due dates.
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <SalesInvoicesTable />
      </Suspense>
    </div>
  );
}
