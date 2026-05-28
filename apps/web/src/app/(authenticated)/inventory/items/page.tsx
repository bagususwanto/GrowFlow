'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { ItemsTable } from '@web/components/items/items-table';
import { CategoryItemsTable } from '@web/components/category-items/category-items-table';
import { Button } from '@web/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';

export default function ItemsPage() {
  const [activeTab, setActiveTab] = useState('items');
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

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

      <Card className="py-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center px-6 pt-4 border-b gap-4">
            <TabsList variant="line" className="-mb-[1px] w-full sm:w-auto justify-start">
              <TabsTrigger value="items" className="text-sm pb-3">Items Master</TabsTrigger>
              <TabsTrigger value="categories" className="text-sm pb-3">Categories</TabsTrigger>
            </TabsList>

            <div className="pb-3 flex items-center w-full sm:w-auto justify-end">
              {activeTab === 'items' ? (
                <Button
                  size="sm"
                  nativeButton={false}
                  render={
                    <Link href="/inventory/items/new">
                      <PlusIcon className="mr-1.5 w-3.5 h-3.5" />
                      Add Item
                    </Link>
                  }
                />
              ) : (
                <Button size="sm" onClick={() => setIsCreateCategoryOpen(true)}>
                  <PlusIcon className="mr-1.5 w-3.5 h-3.5" />
                  Add Category
                </Button>
              )}
            </div>
          </div>

          <CardContent className="p-6">
            <TabsContent value="items" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <ItemsTable />
              </Suspense>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <CategoryItemsTable
                  isCreateOpen={isCreateCategoryOpen}
                  onOpenChange={setIsCreateCategoryOpen}
                />
              </Suspense>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
