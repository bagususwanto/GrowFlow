import { Suspense } from 'react';
import { ChartOfAccountsTable } from '@web/components/accounting/chart-of-accounts/chart-of-accounts-table';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Chart of Accounts | GrowFlow',
  description: 'Manage accounting ledger accounts, types, categories, and account structures.',
};

export default function ChartOfAccountsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Chart of Accounts</h1>
          <p className="text-muted-foreground text-sm">
            Structure your ledger accounts to organize financial transactions under PSAK guidelines.
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <ChartOfAccountsTable />
      </Suspense>
    </div>
  );
}
