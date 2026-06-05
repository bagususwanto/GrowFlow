import { JournalEntryForm } from '@web/components/accounting/journal-entries/journal-entry-form';

export const metadata = {
  title: 'New Journal Entry | GrowFlow',
  description: 'Create a new double-entry manual journal entry.',
};

export default function NewJournalEntryPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <JournalEntryForm />
    </div>
  );
}
