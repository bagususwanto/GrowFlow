import { Suspense } from 'react';
import { AccountingSettingsForm } from '@web/components/accounting/settings/accounting-settings-form';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Accounting Settings | GrowFlow',
  description: 'Configure default system ledger account mappings.',
};

export default function AccountingSettingsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <AccountingSettingsForm />
      </Suspense>
    </div>
  );
}
