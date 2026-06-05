import { Suspense } from 'react';
import { VendorInvoiceDetailContainer } from '@web/components/purchasing/vendor-invoices/vendor-invoice-detail-container';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Vendor Bill Details | GrowFlow',
  description: 'View accounts payable details, cross-referenced receipts, and record supplier payments.',
};

export default function VendorInvoiceDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <VendorInvoiceDetailContainer />
      </Suspense>
    </div>
  );
}
