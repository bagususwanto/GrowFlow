'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { ShoppingCart, Boxes, ArrowRight, Users, Package } from 'lucide-react';

export default function PurchasingOverviewPage() {
  const menus = [
    {
      title: 'Purchase Orders',
      description: 'Create and monitor commercial purchase orders placed with suppliers.',
      href: '/purchasing/purchase-orders',
      icon: <ShoppingCart className="h-6 w-6 text-blue-500" />,
      gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
      actionText: 'Purchase Orders',
      quickActionHref: '/purchasing/purchase-orders/new',
      quickActionText: 'Create PO',
    },
    {
      title: 'Goods Receipts',
      description: 'Log and track incoming items, verify shipments, and update inventory quantities.',
      href: '/purchasing/goods-receipts',
      icon: <Boxes className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20',
      actionText: 'Goods Receipts',
      quickActionHref: '/purchasing/goods-receipts/new',
      quickActionText: 'Receive Goods',
    },
    {
      title: 'Suppliers',
      description: 'Manage purchasing suppliers, track performance, and handle supply contracts.',
      href: '/purchasing/suppliers',
      icon: <Users className="h-6 w-6 text-blue-500" />,
      gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
      actionText: 'Suppliers',
      quickActionHref: '/partners/new',
      quickActionText: 'Add Supplier',
    },
    {
      title: 'Products Reference',
      description: 'View products master list, purchasable items, and catalog details.',
      href: '/purchasing/products',
      icon: <Package className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/20 dark:to-violet-500/20',
      actionText: 'Catalog',
      quickActionHref: '/inventory/items/new',
      quickActionText: 'Add Item',
    },
  ];

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-6xl mx-auto py-4">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-blue-500/5 via-indigo-500/5 to-transparent p-6 sm:p-8 border border-blue-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShoppingCart className="h-32 w-32 text-blue-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShoppingCart className="h-3 w-3" />
            Purchasing Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            Procurement & Purchasing
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Manage your procurement pipeline, create formal purchase orders, match delivery bills with received goods, and verify your stock updates automatically.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-blue-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-blue-500 transition-colors">
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
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
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
