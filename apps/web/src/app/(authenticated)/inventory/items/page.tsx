import Link from 'next/link';
import { Suspense } from 'react';
import { ItemsTable } from '@web/components/items/items-table';
import { CategoryItemsTable } from '@web/components/category-items/category-items-table';
import { Button } from '@web/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';

export const metadata = {
  title: 'Items & Categories | GrowFlow',
  description: 'Manage master items catalog and item categories.',
};

export default function ItemsPage() {
  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Items Master</h1>
          <p className="text-muted-foreground text-sm">
            Manage system items, define safety stocks, and organize product categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/inventory/items/new">
                <PlusIcon className="mr-2 w-4 h-4" />
                Add Item
              </Link>
            }
          />
        </div>
      </div>

      <Card className="py-0 overflow-hidden">
        <Tabs defaultValue="items" className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList variant="line" className="-mb-[1px]">
              <TabsTrigger value="items" className="text-sm pb-3">Items Master</TabsTrigger>
              <TabsTrigger value="categories" className="text-sm pb-3">Categories</TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-6">
            <TabsContent value="items" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <ItemsTable />
              </Suspense>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <CategoryItemsTable />
              </Suspense>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
