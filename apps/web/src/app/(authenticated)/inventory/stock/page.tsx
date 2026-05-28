'use client';

import * as React from 'react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { StockBalanceTable } from '@web/components/stock/stock-balance-table';
import { StockMutationsTable } from '@web/components/stock/stock-mutations-table';
import { Button } from '@web/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { PlusIcon } from 'lucide-react';
import { Card, CardContent } from '@web/components/ui/card';
import { Skeleton } from '@web/components/ui/skeleton';

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('balance');

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-bold text-foreground text-2xl tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground text-sm">
            Monitor current inventory balances across warehouses and track stock movements.
          </p>
        </div>
      </div>

      <Card className="py-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center px-6 pt-4 border-b gap-4">
            <TabsList variant="line" className="-mb-[1px] w-full sm:w-auto justify-start">
              <TabsTrigger value="balance" className="text-sm pb-3">Stock Balance</TabsTrigger>
              <TabsTrigger value="mutations" className="text-sm pb-3">Mutations History</TabsTrigger>
            </TabsList>

            <div className="pb-3 flex items-center w-full sm:w-auto justify-end">
              <Button
                size="sm"
                nativeButton={false}
                render={
                  <Link href="/inventory/stock/adjust">
                    <PlusIcon className="mr-1.5 w-3.5 h-3.5" />
                    Adjust Stock
                  </Link>
                }
              />
            </div>
          </div>

          <CardContent className="p-6">
            <TabsContent value="balance" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <StockBalanceTable />
              </Suspense>
            </TabsContent>

            <TabsContent value="mutations" className="space-y-4 outline-none">
              <Suspense fallback={<Skeleton className="w-full h-96" />}>
                <StockMutationsTable />
              </Suspense>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
