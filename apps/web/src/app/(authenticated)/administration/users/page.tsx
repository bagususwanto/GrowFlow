import Link from 'next/link';
import { Suspense } from 'react';
import { UsersTable } from '@web/components/users/users-table';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Users Management | GrowFlow',
  description: 'Manage system users and their permissions.',
};

export default function UsersPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm">
            Manage system users, view system roles, and assign permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/administration/users/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                Add User
              </Link>
            }
          />
        </div>
      </div>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}
