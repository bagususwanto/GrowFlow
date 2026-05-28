import Link from 'next/link';
import { Suspense } from 'react';
import { RolesTable } from '@web/components/roles/roles-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Roles Management | GrowFlow',
  description: 'Manage system roles and their permissions.',
};

export default function RolesPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Roles</h1>
          <p className="text-muted-foreground text-sm">
            Manage system roles and configure specific permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/administration/roles/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Role
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <RolesTable />
      </Suspense>
    </div>
  );
}
