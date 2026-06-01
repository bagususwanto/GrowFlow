'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Users, Shield, ArrowRight } from 'lucide-react';

export default function AdministrationOverviewPage() {
  const menus = [
    {
      title: 'Users Management',
      description: 'Manage registered users, update profile details, and adjust active statuses.',
      href: '/administration/users',
      icon: <Users className="h-6 w-6 text-gray-500" />,
      gradient: 'from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20',
      actionText: 'Manage Users',
      quickActionHref: '/administration/users/new',
      quickActionText: 'Add User',
    },
    {
      title: 'Roles & Permissions',
      description: 'Configure custom user groups, assign precise security permissions, and protect features.',
      href: '/administration/roles',
      icon: <Shield className="h-6 w-6 text-slate-500" />,
      gradient: 'from-slate-500/10 to-zinc-500/10 dark:from-slate-500/20 dark:to-zinc-500/20',
      actionText: 'Manage Roles',
      quickActionHref: '/administration/roles/new',
      quickActionText: 'Add Role',
    },
  ];

  return (
    <div className="space-y-8 px-4 lg:px-6 max-w-6xl mx-auto py-4">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-slate-500/5 via-zinc-500/5 to-transparent p-6 sm:p-8 border border-slate-500/10">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Shield className="h-32 w-32 text-slate-500" />
        </div>
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400">
            <Shield className="h-3 w-3" />
            Administration Hub
          </div>
          <h1 className="font-bold text-foreground text-3xl sm:text-4xl tracking-tight">
            System Administration
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Configure system configurations, manage organizational employee accounts, create customized security permission levels, and secure operations.
          </p>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu, idx) => (
          <Card 
            key={idx} 
            className="group/item relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card/45 backdrop-blur-xs border-foreground/10 hover:border-slate-500/30 flex flex-col h-full"
          >
            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${menu.gradient}`}>
                {menu.icon}
              </div>
              <CardTitle className="font-bold text-xl tracking-tight group-hover/item:text-slate-500 transition-colors">
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
                    className="w-full sm:w-auto bg-slate-600 hover:bg-slate-500 text-white"
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
