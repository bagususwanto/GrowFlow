'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Landmark, FileSpreadsheet, BarChart, Settings, ArrowRight } from 'lucide-react';

export default function AccountingOverviewPage() {
  const menus = [
    {
      title: 'Chart of Accounts',
      description: 'Manage your organization\'s general ledger accounts, track balances, and organize accounting structure.',
      href: '/accounting/chart-of-accounts',
      icon: <Landmark className="h-6 w-6 text-violet-500" />,
      gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20',
      actionText: 'Chart of Accounts',
      quickActionHref: null,
      quickActionText: null,
    },
    {
      title: 'Journal Entries',
      description: 'Record manual double-entry accounting transactions, post adjustments, and view audit trails.',
      href: '/accounting/journal-entries',
      icon: <FileSpreadsheet className="h-6 w-6 text-purple-500" />,
      gradient: 'from-purple-500/10 to-fuchsia-500/10 dark:from-purple-500/20 dark:to-fuchsia-500/20',
      actionText: 'Journal Entries',
      quickActionHref: '/accounting/journal-entries/new',
      quickActionText: 'New Entry',
    },
    {
      title: 'Trial Balance',
      description: 'View all debit and credit balances for all accounts to verify double-entry alignment.',
      href: '/accounting/reports/trial-balance',
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20',
      actionText: 'Trial Balance',
      quickActionHref: null,
      quickActionText: null,
    },
    {
      title: 'Profit & Loss',
      description: 'Track revenue, expenses, and net income over customizable fiscal periods.',
      href: '/accounting/reports/profit-loss',
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20',
      actionText: 'Profit & Loss',
      quickActionHref: null,
      quickActionText: null,
    },
    {
      title: 'AP Aging Report',
      description: 'Monitor unpaid supplier invoices and track accounts payable aging breakdown.',
      href: '/accounting/reports/ap-aging',
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20',
      actionText: 'AP Aging',
      quickActionHref: null,
      quickActionText: null,
    },
    {
      title: 'AR Aging Report',
      description: 'Analyze outstanding customer invoices and track accounts receivable aging breakdown.',
      href: '/accounting/reports/ar-aging',
      icon: <BarChart className="h-6 w-6 text-indigo-500" />,
      gradient: 'from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20',
      actionText: 'AR Aging',
      quickActionHref: null,
      quickActionText: null,
    },
    {
      title: 'Settings',
      description: 'Configure fiscal start dates, currency formats, and default accounts.',
      href: '/accounting/settings',
      icon: <Settings className="h-6 w-6 text-violet-500" />,
      gradient: 'from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20',
      actionText: 'Settings',
      quickActionHref: null,
      quickActionText: null,
    },
  ];

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-6xl mx-auto py-4">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-violet-500/5 via-purple-500/5 to-transparent p-6 sm:p-8 border border-violet-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Landmark className="h-32 w-32 text-violet-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Landmark className="h-3 w-3" />
            Accounting Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            Financials & Accounting
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Manage your double-entry bookkeeping, configure your chart of accounts, record manual journal entries, and generate essential financial statements and aging reports.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-violet-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-violet-500 transition-colors">
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
                    className="w-full sm:w-auto bg-violet-600 hover:bg-violet-500 text-white"
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
