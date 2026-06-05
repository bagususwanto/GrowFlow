import { Suspense } from 'react';
import { AgingReportView } from '@web/components/accounting/reports/aging-report-view';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Accounts Payable (AP) Aging | GrowFlow',
  description: 'Audits outstanding vendor bills and payment schedules by age.',
};

export default function APAgingReportPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <AgingReportView type="AP" />
      </Suspense>
    </div>
  );
}
