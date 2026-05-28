import Link from 'next/link';
import { Suspense } from 'react';
import { ItemsTable } from '@web/components/items/items-table';
import { CategoryItemsTable } from '@web/components/category-items/category-items-table';
import { Button } from '@web/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { PlusIcon } from 'lucide-react';

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
      </div>

      <Tabs defaultValue="items" className="space-y-6 w-full">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 border-b pb-1">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="items" className="text-sm">Items Master</TabsTrigger>
            <TabsTrigger value="categories" className="text-sm">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="mt-0 flex items-center gap-2">
            <Button
              nativeButton={false}
              render={
                <Link href="/inventory/items/new">
                  <PlusIcon className="mr-1.5 w-4 h-4" />
                  Add Item
                </Link>
              }
            />
          </TabsContent>
        </div>

        <TabsContent value="items" className="space-y-4 outline-none">
          <Suspense fallback={<div className="w-full h-96 bg-card animate-pulse rounded-lg border" />}>
            <ItemsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 outline-none">
          <Suspense fallback={<div className="w-full h-96 bg-card animate-pulse rounded-lg border" />}>
            <CategoryItemsTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
