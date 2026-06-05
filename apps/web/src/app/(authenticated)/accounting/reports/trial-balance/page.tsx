import { Suspense } from 'react';
import { TrialBalanceView } from '@web/components/accounting/reports/trial-balance-view';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Trial Balance | GrowFlow',
  description: 'Audits ledger transactions and validates debit/credit balances.',
};

export default function TrialBalanceReportPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <TrialBalanceView />
      </Suspense>
    </div>
  );
}
