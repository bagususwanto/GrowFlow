import Link from 'next/link';
import { Suspense } from 'react';
import { PartnersDirectoryClient } from '@web/components/partners/partners-directory-client';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Partners Directory | GrowFlow',
  description: 'Manage customers and suppliers.',
};

export default function PartnersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Partners Directory</h1>
          <p className="text-muted-foreground text-sm">
            Manage your suppliers, customers, and business contacts in a single centralized master dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/partners/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Partner
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PartnersDirectoryClient />
      </Suspense>
    </div>
  );
}
