'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Package, Warehouse, Boxes, ArrowRight, Sprout } from 'lucide-react';

export default function InventoryOverviewPage() {
  const menus = [
    {
      title: 'Items Master',
      description: 'Manage system items, define safety stocks, and organize product categories.',
      href: '/inventory/items',
      icon: <Package className="h-6 w-6 text-emerald-500" />,
      gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
      actionText: 'Manage Items',
      quickActionHref: '/inventory/items/new',
      quickActionText: 'Add Item',
    },
    {
      title: 'Warehouses',
      description: 'Manage physical warehouse locations, storage zones, and capacity mapping.',
      href: '/inventory/warehouses',
      icon: <Warehouse className="h-6 w-6 text-teal-500" />,
      gradient: 'from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20',
      actionText: 'Manage Warehouses',
    },
    {
      title: 'Stock Management',
      description: 'Monitor stock levels, track inventory movements, and record adjustments.',
      href: '/inventory/stock',
      icon: <Boxes className="h-6 w-6 text-green-500" />,
      gradient: 'from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20',
      actionText: 'View Stock',
    },
  ];

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-6xl mx-auto py-4">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-6 sm:p-8 border border-emerald-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Sprout className="h-32 w-32 text-emerald-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Sprout className="h-3 w-3" />
            Inventory Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            Inventory & Stock
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Monitor and optimize your product inventory across multiple warehouses. Create product categories, set safety stock rules, and track real-time stock levels.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-emerald-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-emerald-500 transition-colors">
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
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
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
