'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Boxes, ArrowRight, TruckIcon, ShoppingBagIcon } from 'lucide-react';
import { useAuthStore } from '@web/stores/auth.store';
import { hasPermission } from '@web/lib/permissions';

export default function LogisticsOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  const userPermissions = user?.permissions || [];

  const menus = [
    {
      title: 'Goods Receipts',
      description: 'Log and track incoming items, verify shipments, and update inventory quantities.',
      href: '/logistics/goods-receipts',
      icon: <ShoppingBagIcon className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20',
      actionText: 'Goods Receipts',
      quickActionHref: '/logistics/goods-receipts/new',
      quickActionText: 'Receive Goods',
      permission: 'read:goods-receipts',
      roles: ['superadmin', 'manager', 'warehouse', 'purchasing'],
    },
    {
      title: 'Delivery Notes',
      description: 'Generate customer shipment receipts, handle warehouse logistics, and confirm deliveries.',
      href: '/logistics/delivery-notes',
      icon: <TruckIcon className="h-6 w-6 text-orange-500" />,
      gradient: 'from-orange-500/10 to-rose-500/10 dark:from-orange-500/20 dark:to-rose-500/20',
      actionText: 'Delivery Notes',
      quickActionHref: '/logistics/delivery-notes/new',
      quickActionText: 'Ship Order',
      permission: 'read:delivery-notes',
      roles: ['superadmin', 'manager', 'warehouse'],
    },
  ];

  const filteredMenus = menus.filter(
    (menu) =>
      (!menu.roles || (userRole && menu.roles.includes(userRole))) &&
      (!menu.permission || hasPermission(userPermissions, menu.permission))
  );

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-6xl mx-auto py-4">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-indigo-500/5 via-violet-500/5 to-transparent p-6 sm:p-8 border border-indigo-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Boxes className="h-32 w-32 text-indigo-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Boxes className="h-3 w-3" />
            Logistics Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            Logistics & Operations
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Manage incoming shipments via Goods Receipts, process customer orders via Delivery Notes, and keep physical stock balances in sync with warehouse operations.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMenus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-indigo-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-indigo-500 transition-colors">
                {menu.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 justify-between gap-6 pt-2">
              <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                {menu.description}
              </CardDescription>

              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  nativeButton={false}
                  render={
                    <Link href={menu.href}>
                      <span>{menu.actionText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/item:translate-x-1" />
                    </Link>
                  }
                />
                {menu.quickActionHref && (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white"
                    nativeButton={false}
                    render={
                      <Link href={menu.quickActionHref}>
                        {menu.quickActionText}
                      </Link>
                    }
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
