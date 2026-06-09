'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { ShoppingCart, Boxes, ArrowRight, Users, Package } from 'lucide-react';
import { useAuthStore } from '@web/stores/auth.store';
import { hasPermission } from '@web/lib/permissions';

export default function SalesOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.role;
  const userPermissions = user?.permissions || [];

  const menus = [
    {
      title: 'Sales Orders',
      description: 'Manage sales orders received from customers and track fulfillment progress.',
      href: '/sales/sales-orders',
      icon: <ShoppingCart className="h-6 w-6 text-amber-500" />,
      gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
      actionText: 'Sales Orders',
      quickActionHref: '/sales/sales-orders/new',
      quickActionText: 'Create SO',
      permission: 'read:sales-orders',
      roles: ['superadmin', 'manager', 'sales'],
    },
    {
      title: 'Delivery Notes',
      description: 'Generate customer shipment receipts, handle warehouse logistics, and confirm deliveries.',
      href: '/sales/delivery-notes',
      icon: <Boxes className="h-6 w-6 text-orange-500" />,
      gradient: 'from-orange-500/10 to-rose-500/10 dark:from-orange-500/20 dark:to-rose-500/20',
      actionText: 'Delivery Notes',
      quickActionHref: '/sales/delivery-notes/new',
      quickActionText: 'Ship Order',
      permission: 'read:delivery-notes',
      roles: ['superadmin', 'manager', 'warehouse'],
    },
    {
      title: 'Sales Invoices',
      description: 'Review invoice statements, monitor status, apply credit notes, and record customer payments.',
      href: '/sales/invoices',
      icon: <ShoppingCart className="h-6 w-6 text-emerald-500" />,
      gradient: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20',
      actionText: 'Invoices',
      quickActionHref: null,
      quickActionText: null,
      permission: 'read:invoices',
      roles: ['superadmin', 'manager', 'sales', 'finance'],
    },
    {
      title: 'Customers',
      description: 'Manage sales customers, view contact details, and manage billing profiles.',
      href: '/sales/customers',
      icon: <Users className="h-6 w-6 text-amber-500" />,
      gradient: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20',
      actionText: 'Customers',
      quickActionHref: `/partners/new?from=${encodeURIComponent('/sales/customers')}`,
      quickActionText: 'Add Customer',
      permission: 'read:partners',
      roles: ['superadmin', 'manager', 'sales'],
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
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-amber-500/5 via-orange-500/5 to-transparent p-6 sm:p-8 border border-amber-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShoppingCart className="h-32 w-32 text-amber-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShoppingCart className="h-3 w-3" />
            Sales Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            Order Fulfillment & Sales
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Track customer commitments, log purchase requests, process order status, prepare outbound shipments, and dispatch delivery notes instantly.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMenus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-amber-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-amber-500 transition-colors">
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
                    className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white"
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
