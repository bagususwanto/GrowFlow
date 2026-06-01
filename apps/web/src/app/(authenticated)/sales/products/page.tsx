import { Suspense } from 'react';
import Link from 'next/link';
import { ItemsTable } from '@web/components/items/items-table';
import { Skeleton } from '@web/components/ui/skeleton';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { PlusIcon } from 'lucide-react';

export const metadata = {
  title: 'Products Reference | Sales | GrowFlow',
  description: 'View sales products catalog and inventory items reference.',
};

export default function SalesProductsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Products Reference</h1>
          <p className="text-muted-foreground text-sm">
            View system products reference and catalog details for sales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href={`/inventory/items/new?from=${encodeURIComponent('/sales/products')}`}>
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Product
              </Link>
            }
          />
        </div>
      </div>

      <Card className="py-0 overflow-hidden">
        <CardContent className="p-6">
          <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <ItemsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
