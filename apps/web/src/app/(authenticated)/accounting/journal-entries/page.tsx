import { Suspense } from 'react';
import Link from 'next/link';
import { JournalEntriesTable } from '@web/components/accounting/journal-entries/journal-entries-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Journal Entries | GrowFlow',
  description: 'Manage manual journal adjustments and track automatically generated system transactions.',
};

export default function JournalEntriesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Journal Entries</h1>
          <p className="text-muted-foreground text-sm">
            Record manual double-entry journals or audit automated transaction postings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/accounting/journal-entries/new">
                <PlusIcon className="mr-2 w-4.5 h-4.5" />
                New Journal Entry
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <JournalEntriesTable />
      </Suspense>
    </div>
  );
}
