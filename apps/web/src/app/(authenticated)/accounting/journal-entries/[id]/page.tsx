import { Suspense } from 'react';
import { JournalEntryDetailContainer } from '@web/components/accounting/journal-entries/journal-entry-detail-container';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Journal Entry Details | GrowFlow',
  description: 'View double-entry debits, credits, normal balances, and accounting settings.',
};

export default function JournalEntryDetailPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <JournalEntryDetailContainer />
      </Suspense>
    </div>
  );
}
