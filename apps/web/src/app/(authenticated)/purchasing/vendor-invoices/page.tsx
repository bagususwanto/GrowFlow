import { Suspense } from 'react';
import { VendorInvoicesTable } from '@web/components/purchasing/vendor-invoices/vendor-invoices-table';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Vendor Invoices | GrowFlow',
  description: 'Manage supplier bills, accounts payable, and track supplier payments.',
};

export default function VendorInvoicesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Vendor Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Receive, track, and record payments for vendor bills (accounts payable).
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <VendorInvoicesTable />
      </Suspense>
    </div>
  );
}
