import { Suspense } from 'react';
import { ProfitLossView } from '@web/components/accounting/reports/profit-loss-view';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Profit & Loss | GrowFlow',
  description: 'Income statement summarizing company revenues, cost of sales, and operating expenses.',
};

export default function ProfitLossReportPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <ProfitLossView />
      </Suspense>
    </div>
  );
}
