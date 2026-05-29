import Link from 'next/link';
import { CreatePartnerContainer } from '@web/components/partners/create-partner-container';
import { Button } from '@web/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';

export const metadata = {
  title: 'Add Partner | GrowFlow',
  description: 'Create a new customer or supplier.',
};

export default function NewPartnerPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <Link href="/relations/partners" title="Back to Partners">
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          }
        />
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Add Partner
          </h1>
          <p className="text-sm text-muted-foreground">
            Create a new partner profile and details.
          </p>
        </div>
      </div>

      <CreatePartnerContainer />
    </div>
  );
}
