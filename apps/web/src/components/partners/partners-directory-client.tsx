'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Users, ShoppingBag, Truck, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@web/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@web/components/ui/tabs';
import { usePartners } from './use-partners';
import { PartnersTable } from './partners-table';

export function PartnersDirectoryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL type param sync (all | CUSTOMER | SUPPLIER)
  const urlType = searchParams.get('type') || 'all';

  // State to manage current tab locally for snappy response before router updates
  const [activeTab, setActiveTab] = React.useState(urlType);

  React.useEffect(() => {
    setActiveTab(urlType);
  }, [urlType]);

  // Fetch KPI data in parallel with light payload (limit 1)
  const { data: totalData, isLoading: isTotalLoading } = usePartners({ limit: 1 });
  const { data: customerData, isLoading: isCustomerLoading } = usePartners({ limit: 1, type: 'CUSTOMER' });
  const { data: supplierData, isLoading: isSupplierLoading } = usePartners({ limit: 1, type: 'SUPPLIER' });

  const totalCount = totalData?.total ?? 0;
  const customerCount = customerData?.total ?? 0;
  const supplierCount = supplierData?.total ?? 0;

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    const newParams = new URLSearchParams(searchParams.toString());
    
    // Reset page to 1 when changing tabs
    newParams.set('page', '1');

    if (val === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', val);
    }

    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Premium KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Total Partners */}
        <Card className="group relative overflow-hidden border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-indigo-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-indigo-400">Total Partners</p>
              <div className="flex items-baseline gap-2">
                {isTotalLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                ) : (
                  <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {totalCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Combined business entities</p>
            </div>
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400 transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:scale-110">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Customers */}
        <Card className="group relative overflow-hidden border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-emerald-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-400">Customers</p>
              <div className="flex items-baseline gap-2">
                {isCustomerLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                ) : (
                  <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {customerCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Active buying entities</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400 transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:scale-110">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Suppliers */}
        <Card className="group relative overflow-hidden border border-amber-500/10 bg-amber-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-amber-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-amber-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-amber-400">Suppliers</p>
              <div className="flex items-baseline gap-2">
                {isSupplierLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                ) : (
                  <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                    {supplierCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Active supply providers</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:scale-110">
              <Truck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation and Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-1">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList variant="line" className="h-10">
              <TabsTrigger value="all" className="px-4 py-2 text-sm font-semibold">
                All Partners
              </TabsTrigger>
              <TabsTrigger value="CUSTOMER" className="px-4 py-2 text-sm font-semibold">
                Customers
              </TabsTrigger>
              <TabsTrigger value="SUPPLIER" className="px-4 py-2 text-sm font-semibold">
                Suppliers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Dynamic Table based on current active tab */}
        <PartnersTable
          fixedType={activeTab === 'all' ? undefined : (activeTab as 'CUSTOMER' | 'SUPPLIER')}
          hideTypeFilter={true}
        />
      </div>
    </div>
  );
}
